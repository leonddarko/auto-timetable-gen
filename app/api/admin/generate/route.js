import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Course from "@/models/Course";
import Venue from "@/models/Venue";
import Timetable from "@/models/Timetable";

const WORKING_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const STANDARD_PERIODS = ["08:00 - 10:00", "10:00 - 12:00", "13:00 - 15:00", "15:00 - 17:00"];

export async function GET() {
  try {
    await connectDB();
    const data = await Timetable.find()
      .populate({ path: "courseId", populate: { path: "lecturer", select: "name" } })
      .populate("venueId");
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: "Fetch error" }, { status: 500 });
  }
}

export async function POST() {
  try {
    await connectDB();

    // 1. Flush existing master schedule constraints clean
    await Timetable.deleteMany({});

    // 2. Fetch required asset pools
    const courses = await Course.find().populate("lecturer");
    const venues = await Venue.find();

    if (courses.length === 0 || venues.length === 0) {
      return NextResponse.json({ message: "Please build courses and venues pools first." }, { status: 400 });
    }

    const allocatedSlots = [];

    // 3. Process every course element sequentially
    for (const course of courses) {
      // Calculate how many distinct 2-hour block entries must be mapped (e.g. 3 hours total = 2 blocks round-up)
      const sessionsNeeded = Math.ceil(course.weeklyHours / 2);
      let sessionsScheduled = 0;

      // Scan standard time configurations safely looking for a conflict-free match
      for (const day of WORKING_DAYS) {
        if (sessionsScheduled >= sessionsNeeded) break;

        for (const period of STANDARD_PERIODS) {
          if (sessionsScheduled >= sessionsNeeded) break;

          for (const venue of venues) {
            
            // Check constraint clash rules
            const hasConflict = allocatedSlots.some(slot => {
              const isSameTime = slot.day === day && slot.period === period;
              if (!isSameTime) return false;

              // Collision Rule A: Classroom is already booked
              const venueClash = slot.venueId.toString() === venue._id.toString();

              // Collision Rule B: Lecturer cannot be in two places at once
              const lecturerClash = slot.lecturerId?.toString() === course.lecturer?._id?.toString();

              // Collision Rule C: Student Year Group Level cannot have two concurrent classes
              const studentGroupClash = slot.level === course.level && slot.department === course.department;

              return venueClash || lecturerClash || studentGroupClash;
            });

            // Safe block found: write slot memory reference pointers
            if (!hasConflict) {
              allocatedSlots.push({
                courseId: course._id,
                venueId: venue._id,
                day,
                period,
                // In-memory properties used to speed up loop conflict matching checks
                lecturerId: course.lecturer?._id,
                level: course.level,
                department: course.department
              });

              sessionsScheduled++;
              break; // Drop out of venue selection loop to schedule the next session on another day or period
            }
          }
        }
      }

      // Safeguard error catching check if parameters cannot satisfy schema constraints
      if (sessionsScheduled < sessionsNeeded) {
        return NextResponse.json({ 
          message: `Incomplete schedule map. Could not satisfy allocation constraints safely for course: ${course.code}` 
        }, { status: 422 });
      }
    }

    // 4. Batch persist all validated schedule slots into MongoDB
    await Timetable.insertMany(allocatedSlots);

    return NextResponse.json({ message: "Timetable generated successfully", count: allocatedSlots.length }, { status: 201 });

  } catch (error) {
    console.error("GENERATION ERROR:", error);
    return NextResponse.json({ message: "Internal generation execution failure", error: error.message }, { status: 500 });
  }
}