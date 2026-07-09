"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session, status } = useSession();

    const errorParam = searchParams.get("error");

    const [form, setForm] = useState({
        email: "",
        password: "",
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

    useEffect(() => {
        if (errorParam) {
            setError("Invalid email or password");
        }
    }, [errorParam]);

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

        const res = await signIn("credentials", {
            email: form.email,
            password: form.password,
            redirect: false,
        });

        if (res?.error) {
            console.log(res.error);
            setError("Invalid email or password");
            setLoading(false);
            return;
        }

        router.refresh(); // triggers NextAuth session updates
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200 font-sans text-base-content px-6 relative">
            
            {/* Back to Home Navigation anchor */}
            <Link 
                href="/" 
                className="absolute top-6 left-6 btn btn-ghost gap-2 normal-case rounded-full text-neutral"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
            </Link>

            <div className="card w-full max-w-md bg-base-100 shadow-xl border border-base-300 rounded-3xl p-6 md:p-8">
                <div className="flex flex-col items-center mb-6">
                    <div className="bg-primary/10 p-3 rounded-full text-primary mb-2">
                        <LogIn className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-white text-center">Welcome Back</h2>
                    <p className="text-xs text-base-content/60 mt-1">Sign in to access your timetable portal</p>
                </div>

                {error && (
                    <div className="alert alert-error mb-4 rounded-xl text-sm py-3 text-error-content shadow-sm">
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email Input Field */}
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

                    {/* Password Input Field */}
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

                    {/* Submit Button Utility */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary btn-block rounded-xl mt-2 text-white font-bold"
                    >
                        {loading ? (
                            <span className="flex justify-center items-center gap-2">
                                <span className="loading loading-spinner loading-md"></span>
                                Signing in...
                            </span>
                        ) : (
                            "Login"
                        )}
                    </button>
                </form>

                {/* Account Switcher Meta Context */}
                <p className="text-sm text-base-content/70 mt-6 text-center">
                    Don’t have an account?{" "}
                    <Link href="/sign-up" className="text-primary font-semibold hover:underline">
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
}