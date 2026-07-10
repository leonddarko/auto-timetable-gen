import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import connectDB from "@/lib/db";
import Timetable from "@/models/Timetable";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Double check your exact authOptions path location

export async function GET() {
  try {
    await connectDB();

    // Identify who is making the request using NextAuth server session
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "lecturer") {
      return NextResponse.json(
        { message: "Unauthorized. Lecturer access only." },
        { status: 401 }
      );
    }

    // Query for all timetable blocks, populating course data and room details
    const masterSchedule = await Timetable.find()
      .populate({
        path: "courseId",
        populate: { path: "lecturer", select: "name email" },
      })
      .populate("venueId");

    // Filter in memory for slots belonging to this exact lecturer
    const lecturerSchedule = masterSchedule.filter((slot) => {
      return slot.courseId?.lecturer?._id?.toString() === session.user.id || 
             slot.courseId?.lecturer?.email === session.user.email;
    });

    return NextResponse.json(lecturerSchedule, { status: 200 });
  } catch (error) {
    console.error("LECTURER TIMETABLE FETCH ERROR:", error);
    return NextResponse.json(
      { message: "Failed to read personal schedule.", error: error.message },
      { status: 500 }
    );
  }
}