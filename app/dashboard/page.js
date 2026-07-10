"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Calendar, Clock, MapPin, BookOpen, GraduationCap, AlertCircle } from "lucide-react";
import NavigationBar from "@/components/layout/NavigationBar";

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const TIME_PERIODS = ["08:00 - 10:00", "10:00 - 12:00", "13:00 - 15:00", "15:00 - 17:00"];

export default function LecturerDashboard() {
    const { data: session } = useSession({ required: true });
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [viewMode, setViewMode] = useState("grid"); // 'grid' layout or standard 'list' view

    useEffect(() => {
        async function fetchLecturerSchedule() {
            try {
                const res = await fetch("/api/lecturer/timetable");
                if (!res.ok) {
                    throw new Error("Could not retrieve personalized schedule matrix entries.");
                }
                const data = await res.json();
                setSchedule(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        if (session) {
            fetchLecturerSchedule();
        }
    }, [session]);

    // Utility logic helper to search for matching cell allocations inside our grid render matrix
    const getSlotForCell = (day, period) => {
        return schedule.find((slot) => slot.day === day && slot.period === period);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-base-200 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                    <p className="text-sm font-semibold text-base-content/60 animate-pulse">Assembling personal calendar grid...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <NavigationBar />
            <div className="min-h-screen bg-base-200 pt-24 px-4 md:px-10 pb-12 font-sans">
                <div className="max-w-7xl mx-auto space-y-6">

                    {/* Profile Introduction Greeting Header Banner card */}
                    <div className="bg-base-100 p-6 rounded-3xl border border-base-300 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-wide uppercase mb-1">
                                <GraduationCap className="w-4 h-4" /> Instructor Dashboard
                            </div>
                            <h1 className="text-3xl font-black text-white">
                                Welcome back, {session?.user?.name || "Lecturer"}
                            </h1>
                            <p className="text-sm text-base-content/60 mt-0.5">
                                Review your scheduled 2-hour teaching slots for the current semester pool.
                            </p>
                        </div>

                        {/* Toggle buttons controlling view modes display variants layout selection triggers */}
                        <div className="join bg-base-200 p-1 rounded-xl border border-base-300">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`join-item btn btn-sm rounded-lg font-bold border-none ${viewMode === "grid" ? "bg-primary text-white" : "btn-ghost text-base-content/70"}`}
                            >
                                Weekly Grid
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={`join-item btn btn-sm rounded-lg font-bold border-none ${viewMode === "list" ? "bg-primary text-white" : "btn-ghost text-base-content/70"}`}
                            >
                                Agenda List
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="alert alert-error rounded-2xl shadow-sm text-white flex gap-3">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {schedule.length === 0 && !error ? (
                        <div className="bg-base-100 border border-base-300 rounded-3xl p-12 text-center max-w-xl mx-auto shadow-sm space-y-4">
                            <div className="bg-base-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-base-content/40">
                                <Calendar className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-neutral">No Allocated Teaching Slots</h3>
                                <p className="text-sm text-base-content/60 mt-1">
                                    The Department Secretary hasn't compiled or published the timetable spreadsheet allocations matrix yet.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* VIEW RENDER MODE A: DYNAMIC SEMESTER MATRIX CALENDAR GRID */}
                            {viewMode === "grid" && (
                                <div className="bg-base-100 border border-base-300 rounded-3xl shadow-sm overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="table table-fixed w-full min-w-[800px] border-collapse">

                                            {/* Week headers timeline top tracks row */}
                                            <thead>
                                                <tr className="bg-base-200 border-b border-base-300 text-white font-black text-sm">
                                                    <th className="w-40 py-4 text-center border-r border-base-300 bg-base-200/50">Time Period</th>
                                                    {DAYS_OF_WEEK.map((day) => (
                                                        <th key={day} className="text-center py-4">{day}</th>
                                                    ))}
                                                </tr>
                                            </thead>

                                            {/* Matrix tracking data body slot generation map */}
                                            <tbody>
                                                {TIME_PERIODS.map((period) => (
                                                    <tr key={period} className="border-b border-base-200 hover:bg-transparent">
                                                        {/* Y-Axis Row labels displaying designated hours bounds columns */}
                                                        <td className="font-bold text-white text-xs bg-base-200/20 text-center py-6 border-r border-base-300 flex flex-col justify-center items-center gap-1">
                                                            <Clock className="w-3.5 h-3.5 text-primary" />
                                                            {period}
                                                        </td>

                                                        {/* Render corresponding cross-section grid tracking item boxes loops cells */}
                                                        {DAYS_OF_WEEK.map((day) => {
                                                            const slot = getSlotForCell(day, period);
                                                            return (
                                                                <td key={`${day}-${period}`} className="p-2 h-32 border-r border-base-200 align-top">
                                                                    {slot ? (
                                                                        <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 h-full flex flex-col justify-between transition-all hover:shadow-sm">
                                                                            <div>
                                                                                <div className="font-black text-primary text-sm tracking-tight truncate">
                                                                                    {slot.courseId?.code}
                                                                                </div>
                                                                                <div className="text-xs font-bold text-white line-clamp-2 mt-0.5 leading-tight">
                                                                                    {slot.courseId?.title}
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-center gap-1 text-[11px] font-medium text-base-content/60 bg-base-200/60 w-fit px-2 py-0.5 rounded-md mt-2">
                                                                                <MapPin className="w-3 h-3 text-accent shrink-0" />
                                                                                <span className="truncate max-w-[90px]">{slot.venueId?.name}</span>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="w-full h-full rounded-xl border border-dashed border-base-300/60 bg-base-100 flex items-center justify-center text-[10px] uppercase font-bold text-base-content/20 tracking-wider">
                                                                            Free
                                                                        </div>
                                                                    )}
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                ))}
                                            </tbody>

                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* VIEW RENDER MODE B: CLEAN CHRONOLOGICAL AGENDA LIST */}
                            {viewMode === "list" && (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {schedule.map((slot) => (
                                        <div
                                            key={slot._id}
                                            className="bg-base-100 border border-base-300 p-5 rounded-2xl shadow-sm flex flex-col justify-between space-y-4 hover:border-primary/40 transition-colors"
                                        >
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="badge badge-neutral font-bold text-xs px-2.5 py-1">{slot.day}</span>
                                                    <span className="text-xs font-semibold text-primary flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-lg">
                                                        <Clock className="w-3.5 h-3.5" /> {slot.period}
                                                    </span>
                                                </div>
                                                <div className="space-y-1">
                                                    <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                                                        <BookOpen className="w-4 h-4 text-secondary shrink-0" />
                                                        {slot.courseId?.code}
                                                    </h3>
                                                    <p className="text-sm font-medium text-base-content/70 leading-snug">
                                                        {slot.courseId?.title}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="pt-3 border-t border-base-200 flex justify-between items-center text-xs">
                                                <div className="flex items-center gap-1.5 font-bold text-gray-500">
                                                    <MapPin className="w-4 h-4 text-accent shrink-0" />
                                                    <span>Venue: {slot.venueId?.name}</span>
                                                </div>
                                                <span className="badge badge-ghost font-semibold text-[11px]">
                                                    {slot.courseId?.level || "General"}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                </div>
            </div>
        </>

    );
}