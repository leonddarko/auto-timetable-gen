import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  try {
    await connectDB();
    const lecturers = await User.find({ role: "lecturer" }).select("-password");
    return NextResponse.json(lecturers, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to read data pools", error: error.message }, { status: 500 });
  }
}