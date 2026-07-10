import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Venue from "@/models/Venue";

export async function GET() {
  try {
    await connectDB();
    const venues = await Venue.find();
    return NextResponse.json(venues, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const { name, capacity } = await req.json();

    if (!name || !capacity) {
      return NextResponse.json({ message: "Parameters incomplete" }, { status: 400 });
    }

    const venue = await Venue.create({ name, capacity: Number(capacity) });
    return NextResponse.json(venue, { status: 201 });
  } catch (err) {
    return NextResponse.json({ message: "Save failure" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    await Venue.findByIdAndDelete(id);
    return NextResponse.json({ message: "Venue resource dropped" }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}