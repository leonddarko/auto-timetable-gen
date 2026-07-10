import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Course from "@/models/Course";
import User from "@/models/User"; // Ensure registered inside context population boundaries

export async function GET() {
  try {
    await connectDB();
    const courses = await Course.find().populate("lecturer", "name department");
    return NextResponse.json(courses, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const { code, title, department, level, lecturer, weeklyHours } = await req.json();

    if (!code || !title || !level || !lecturer) {
      return NextResponse.json({ message: "Missing required core details" }, { status: 400 });
    }

    const newCourse = await Course.create({ code, title, department, level, lecturer, weeklyHours });
    return NextResponse.json(newCourse, { status: 201 });
  } catch (err) {
    return NextResponse.json({ message: "Failed writing structure", error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    await Course.findByIdAndDelete(id);
    return NextResponse.json({ message: "Course cleared successfully" }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: "Deletion execution error" }, { status: 500 });
  }
}