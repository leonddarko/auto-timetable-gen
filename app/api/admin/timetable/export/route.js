import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import connectDB from "@/lib/db";
import Timetable from "@/models/Timetable";

export async function GET() {
  try {
    await connectDB();

    // Query for all generated timetable entries with full relation populated
    const scheduleRecords = await Timetable.find()
      .populate({
        path: "courseId",
        populate: { path: "lecturer", select: "name email" },
      })
      .populate("venueId");

    if (scheduleRecords.length === 0) {
      return NextResponse.json(
        { message: "No timetable records exist to export." },
        { status: 400 }
      );
    }

    // Transform MongoDB documents into clean Excel row objects
    const formattedRows = scheduleRecords.map((slot) => ({
      Day: slot.day || "N/A",
      "Time Period": slot.period || "N/A",
      "Course Code": slot.courseId?.code || "N/A",
      "Course Title": slot.courseId?.title || "N/A",
      "Target Level": slot.courseId?.level || "N/A",
      Department: slot.courseId?.department || "N/A",
      "Assigned Venue": slot.venueId?.name || "N/A",
      "Venue Capacity": slot.venueId?.capacity || "N/A",
      "Instructor Name": slot.courseId?.lecturer?.name || "Unassigned",
      "Instructor Email": slot.courseId?.lecturer?.email || "N/A",
    }));

    // Create a worksheet and a workbook
    const worksheet = XLSX.utils.json_to_sheet(formattedRows);

    // Optional: Adjust column widths for better visual presentation
    worksheet["!cols"] = [
      { wch: 12 }, // Day
      { wch: 16 }, // Time Period
      { wch: 14 }, // Course Code
      { wch: 28 }, // Course Title
      { wch: 14 }, // Target Level
      { wch: 20 }, // Department
      { wch: 16 }, // Assigned Venue
      { wch: 15 }, // Venue Capacity
      { wch: 22 }, // Instructor Name
      { wch: 25 }, // Instructor Email
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Department Schedule");

    // Generate buffer array
    const excelBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    // Return the response with Excel attachment headers
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="Department_Timetable_${new Date()
          .toISOString()
          .split("T")[0]}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("EXCEL EXPORT ERROR:", error);
    return NextResponse.json(
      { message: "Failed to export schedule to Excel.", error: error.message },
      { status: 500 }
    );
  }
}