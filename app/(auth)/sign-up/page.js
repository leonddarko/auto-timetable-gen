"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UserPlus, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SignupPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin", // Defaults to admin for your first-time setup
    department: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 🚀 Redirect based on user schema role if already logged in
      useEffect(() => {
          if (status === "authenticated" && session?.user) {
              if (session.user.role === "admin") {
                  router.push("/");
                  // router.push("/admin");
              } else {
                  router.push("/");
                  // router.push("/dashboard"); // Redirect lecturers to their specific timetable dashboard
              }
          }
      }, [status, session, router]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Safeguard: Clear department string if they registered as an Admin
    const registrationPayload = {
      ...form,
      department: form.role === "admin" ? "" : form.department,
    };

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(registrationPayload),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong during registration.");
        setLoading(false);
        return;
      }

      router.push("/sign-in");
    } catch (err) {
      setError("Failed to connect to the registration server.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 font-sans text-base-content px-6 relative">
      
      {/* Back to Home Button Link */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 btn btn-ghost gap-2 rounded-full text-black"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      <div className="card w-full max-w-md bg-base-100 shadow-xl border border-base-300 rounded-3xl p-6 md:p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-secondary/10 p-3 rounded-full text-secondary mb-2">
            <UserPlus className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-white text-center">Create Account</h2>
          <p className="text-xs text-base-content/60 mt-1">Configure your portal credentials</p>
        </div>

        {error && (
          <div className="alert alert-error mb-4 rounded-xl text-sm py-3 text-error-content shadow-sm">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name Input */}
          <div className="form-control">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              className="input input-bordered w-full bg-base-50 text-base-content rounded-xl focus:outline-primary"
              required
            />
          </div>

          {/* Email Input */}
          <div className="form-control">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              className="input input-bordered w-full bg-base-50 text-base-content rounded-xl focus:outline-primary"
              required
            />
          </div>

          {/* Password Input */}
          <div className="form-control">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="input input-bordered w-full bg-base-50 text-base-content rounded-xl focus:outline-primary"
              required
            />
          </div>

          {/* System Role Selector */}
          <div className="form-control w-full">
            <label className="label py-1">
              <span className="label-text font-semibold text-neutral">Portal Role</span>
            </label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="select select-bordered w-full bg-base-50 text-base-content rounded-xl focus:outline-primary"
            >
              <option value="admin">Department Secretary (Admin)</option>
              <option value="lecturer">Lecturer</option>
            </select>
          </div>

          {/* Conditional Department Field (Only renders if 'lecturer' is selected) */}
          {form.role === "lecturer" && (
            <div className="form-control w-full animate-fadeIn">
              <label className="label py-1">
                <span className="label-text font-semibold text-neutral">Assigned Department</span>
              </label>
              <input
                type="text"
                name="department"
                placeholder="e.g., Computer Science"
                value={form.department}
                onChange={handleChange}
                className="input input-bordered w-full bg-base-50 text-base-content rounded-xl focus:outline-primary"
                required={form.role === "lecturer"}
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-secondary btn-block rounded-xl mt-2 text-white font-bold"
          >
            {loading ? (
              <span className="flex justify-center items-center gap-2">
                <span className="loading loading-spinner loading-md"></span>
                Creating account...
              </span>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <p className="text-sm text-base-content/70 mt-6 text-center">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-secondary font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}