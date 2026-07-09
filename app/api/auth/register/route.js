import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(req) {
    try {
        await connectDB();
        const { name, email, password, role, department } = await req.json();

        // 1. Basic validation for core fields
        if (!name || !email || !password || !role) {
            return NextResponse.json(
                { message: "All core fields are required" },
                { status: 400 },
            );
        }

        // 2. Schema specific role validation
        if (!["admin", "lecturer"].includes(role)) {
            return NextResponse.json(
                { message: "Invalid user role specified" },
                { status: 400 },
            );
        }

        // 3. Conditional validation: Lecturers must have an assigned department
        if (role === "lecturer" && (!department || department.trim() === "")) {
            return NextResponse.json(
                { message: "Department is required for lecturers" },
                { status: 400 },
            );
        }

        // 4. Duplicate account checks
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { message: "User already exists" },
                { status: 400 },
            );
        }

        // 5. Encrypt credentials securely
        const hashedPassword = await bcrypt.hash(password, 10);

        // 6. Build the database entry payload safely
        const userPayload = {
            name,
            email,
            password: hashedPassword,
            role,
            // Clean out department data if an administrator account is being built
            department: role === "lecturer" ? department.trim() : undefined,
        };

        await User.create(userPayload);

        return NextResponse.json(
            { message: "User created successfully" },
            { status: 201 },
        );
    } catch (error) {
        console.error("REGISTER ERROR:", error);

        return NextResponse.json(
            {
                message: "Server error",
                error: error.message,
            },
            { status: 500 },
        );
    }
}