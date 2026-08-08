import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Course from "@/models/Course";
import Venue from "@/models/Venue";
import Timetable from "@/models/Timetable";

const WORKING_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const STANDARD_PERIODS = ["08:00 - 10:00", "10:00 - 12:00", "13:00 - 15:00", "15:00 - 17:00"];

// 🎲 Helper function: Fisher-Yates Array Shuffle
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

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

    // 1. Flush existing schedule records clean
    await Timetable.deleteMany({});

    // 2. Fetch required asset pools
    const courses = await Course.find().populate("lecturer");
    const venues = await Venue.find();

    if (courses.length === 0 || venues.length === 0) {
      return NextResponse.json(
        { message: "Please build courses and venues pools first." },
        { status: 400 }
      );
    }

    // Optional: Shuffle course processing order so one course doesn't always get priority
    const shuffledCourses = shuffleArray(courses);
    const allocatedSlots = [];

    // 3. Process each course
    for (const course of shuffledCourses) {
      const sessionsNeeded = Math.ceil(course.weeklyHours / 2);
      let sessionsScheduled = 0;

      // 🎲 RANDOMIZATION STEP: Shuffle the days, periods, and venues for EVERY session attempt!
      const randomDays = shuffleArray(WORKING_DAYS);
      const randomPeriods = shuffleArray(STANDARD_PERIODS);
      const randomVenues = shuffleArray(venues);

      // Search across randomized days, periods, and rooms
      for (const day of randomDays) {
        if (sessionsScheduled >= sessionsNeeded) break;

        for (const period of randomPeriods) {
          if (sessionsScheduled >= sessionsNeeded) break;

          for (const venue of randomVenues) {

            // 4. Check the 3 Safety Rules
            const hasConflict = allocatedSlots.some((slot) => {
              const isSameTime = slot.day === day && slot.period === period;
              if (!isSameTime) return false;

              // Rule A: Venue double-booking
              const venueClash = slot.venueId.toString() === venue._id.toString();

              // Rule B: Lecturer double-booking
              const lecturerClash =
                slot.lecturerId?.toString() === course.lecturer?._id?.toString();

              // Rule C: Student group double-booking
              const studentGroupClash =
                slot.level === course.level && slot.department === course.department;

              return venueClash || lecturerClash || studentGroupClash;
            });

            // If no conflict exists, lock in the slot!
            if (!hasConflict) {
              allocatedSlots.push({
                courseId: course._id,
                venueId: venue._id,
                day,
                period,
                lecturerId: course.lecturer?._id,
                level: course.level,
                department: course.department
              });

              sessionsScheduled++;
              break; // Move to the next session for this course
            }
          }
        }
      }

      // Fallback if tight constraints prevent full allocation
      if (sessionsScheduled < sessionsNeeded) {
        return NextResponse.json(
          {
            message: `Could not fit course ${course.code} even with randomized search. Try adding more venues or time slots!`
          },
          { status: 422 }
        );
      }
    }

    // 5. Batch save all newly allocated slots
    await Timetable.insertMany(allocatedSlots);

    return NextResponse.json(
      { message: "Randomized timetable generated successfully!", count: allocatedSlots.length },
      { status: 201 }
    );

  } catch (error) {
    console.error("GENERATION ERROR:", error);
    return NextResponse.json(
      { message: "Internal generation failure", error: error.message },
      { status: 500 }
    );
  }
}