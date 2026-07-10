"use client";

import { useState, useEffect } from "react";
import { User, BookOpen, MapPin, Calendar, Sparkles, Plus, Trash2 } from "lucide-react";
import NavigationBar from "@/components/layout/NavigationBar";

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("lecturers");
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });

    // Data pools State
    const [lecturers, setLecturers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [venues, setVenues] = useState([]);
    const [timetables, setTimetables] = useState([]);

    // Form capture States
    const [courseForm, setCourseForm] = useState({ code: "", title: "", department: "", level: "", lecturer: "", weeklyHours: 3 });
    const [venueForm, setVenueForm] = useState({ name: "", capacity: "" });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [resLec, resCrse, resVnu, resTmt] = await Promise.all([
                fetch("/api/admin/lecturers"),
                fetch("/api/admin/courses"),
                fetch("/api/admin/venues"),
                fetch("/api/admin/generate")
            ]);

            if (resLec.ok) setLecturers(await resLec.json());
            if (resCrse.ok) setCourses(await resCrse.json());
            if (resVnu.ok) setVenues(await resVnu.json());
            if (resTmt.ok) setTimetables(await resTmt.json());
        } catch (err) {
            showMsg("Failed to read system parameters.", "error");
        } finally {
            setLoading(false);
        }
    };

    const showMsg = (text, type = "success") => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: "", type: "" }), 5000);
    };

    // Generic poster handler
    const handleAddItem = async (endpoint, payload, resetFormFn) => {
        try {
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            showMsg("Item added successfully!");
            if (resetFormFn) resetFormFn();
            fetchData();
        } catch (err) {
            showMsg(err.message || "Failed to submit item", "error");
        }
    };

    // Delete handler
    const handleDeleteItem = async (endpoint, id) => {
        if (!confirm("Are you sure you want to remove this item?")) return;
        try {
            const res = await fetch(`${endpoint}?id=${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Could not drop reference.");
            showMsg("Reference removed cleanly.");
            fetchData();
        } catch (err) {
            showMsg(err.message, "error");
        }
    };

    // Trigger Scheduling Matrix Generator Algorithm
    const triggerAutoGenerator = async () => {
        setGenerating(true);
        showMsg("Running allocation criteria matrix...", "info");
        try {
            const res = await fetch("/api/admin/generate", { method: "POST" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            showMsg(`Success! Allocated ${data.count} timetable items safely without context clashes.`);
            fetchData();
        } catch (err) {
            showMsg(err.message || "Unresolvable collisions occurred during generation.", "error");
        } finally {
            setGenerating(false);
        }
    };

    return (
        <>
            <NavigationBar />
            <div className="min-h-screen bg-base-200 pt-24 px-4 md:px-10 font-sans pb-12">
                <div className="max-w-7xl mx-auto space-y-6">

                    {/* Upper Dashboard Notification Banners */}
                    {message.text && (
                        <div className={`alert rounded-xl shadow-md ${message.type === "error" ? "alert-error text-error-content" : message.type === "info" ? "alert-info text-info-content" : "alert-success text-success-content"}`}>
                            <span>{message.text}</span>
                        </div>
                    )}

                    {/* Branding & Master Trigger Ribbon */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-base-100 p-6 rounded-3xl border border-base-300 shadow-sm gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-white">Department Configurator</h1>
                            <p className="text-sm text-base-content/60">Configure your parameters, then trigger your timetable matrices.</p>
                        </div>
                        <button
                            onClick={triggerAutoGenerator}
                            disabled={generating || courses.length === 0 || venues.length === 0}
                            className="btn btn-secondary text-white rounded-xl gap-2 font-bold shadow-md shadow-secondary/20"
                        >
                            <Sparkles className="w-5 h-5 animate-pulse" />
                            {generating ? "Generating Slots..." : "Generate Timetable"}
                        </button>
                    </div>

                    {/* Simple Statistical Status Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-base-100 border border-base-300 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
                            <div className="bg-primary/10 p-3 rounded-xl text-primary"><User /></div>
                            <div><div className="text-xs text-base-content/50 font-bold uppercase">Lecturers</div><div className="text-2xl font-black text-white">{lecturers.length}</div></div>
                        </div>
                        <div className="bg-base-100 border border-base-300 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
                            <div className="bg-secondary/10 p-3 rounded-xl text-secondary"><BookOpen /></div>
                            <div><div className="text-xs text-base-content/50 font-bold uppercase">Courses</div><div className="text-2xl font-black text-white">{courses.length}</div></div>
                        </div>
                        <div className="bg-base-100 border border-base-300 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
                            <div className="bg-accent/10 p-3 rounded-xl text-accent"><MapPin /></div>
                            <div><div className="text-xs text-base-content/50 font-bold uppercase">Venues</div><div className="text-2xl font-black text-white">{venues.length}</div></div>
                        </div>
                        <div className="bg-base-100 border border-base-300 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
                            <div className="bg-white/10 p-3 rounded-xl text-white"><Calendar /></div>
                            <div><div className="text-xs text-base-content/50 font-bold uppercase">Scheduled Slots</div><div className="text-2xl font-black text-white">{timetables.length}</div></div>
                        </div>
                    </div>

                    {/* Modular Navigation Tabs Section */}
                    <div className="tabs tabs-boxed bg-base-100 border border-base-300 rounded-2xl p-2 max-w-xl">
                        {["lecturers", "courses", "venues", "schedule"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`tab flex-1 font-semibold rounded-xl capitalize transition-all ${activeTab === tab ? "bg-primary text-white" : "text-base-content/70 hover:text-neutral"}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Tab Contents View Panels */}
                    <div className="bg-base-100 border border-base-300 rounded-3xl p-6 shadow-sm min-h-[400px]">
                        {loading ? (
                            <div className="flex h-64 items-center justify-center"><span className="loading loading-spinner loading-lg text-primary"></span></div>
                        ) : (
                            <>
                                {/* LECTURERS VIEW TAB */}
                                {activeTab === "lecturers" && (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center"><h3 className="text-xl font-bold text-white">Registered Faculty Lecturers</h3></div>
                                        <p className="text-xs text-base-content/60">Lecturers join the platform using the explicit <b>Sign-Up Form</b> portal configuration view.</p>
                                        <div className="overflow-x-auto">
                                            <table className="table table-zebra w-full">
                                                <thead><tr className="text-white font-bold"><th>Name</th><th>Email Address</th><th>Assigned Department</th></tr></thead>
                                                <tbody>
                                                    {lecturers.map((lec) => (
                                                        <tr key={lec._id}><td>{lec.name}</td><td>{lec.email}</td><td><span className="badge badge-ghost font-semibold">{lec.department || "N/A"}</span></td></tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* COURSES VIEW TAB */}
                                {activeTab === "courses" && (
                                    <div className="grid lg:grid-cols-3 gap-6">
                                        {/* Create Form Container */}
                                        <div className="bg-base-200 p-5 rounded-2xl border border-base-300 space-y-3 h-fit">
                                            <h4 className="font-bold text-white flex items-center gap-2"><Plus className="w-4 h-4" /> Add New Course</h4>
                                            <input type="text" placeholder="Code (e.g. CS201)" value={courseForm.code} onChange={e => setCourseForm({ ...courseForm, code: e.target.value.toUpperCase() })} className="input input-bordered w-full bg-base-100" />
                                            <input type="text" placeholder="Title (e.g. Data Structures)" value={courseForm.title} onChange={e => setCourseForm({ ...courseForm, title: e.target.value })} className="input input-bordered w-full bg-base-100" />
                                            <input type="text" placeholder="Department Stream" value={courseForm.department} onChange={e => setCourseForm({ ...courseForm, department: e.target.value })} className="input input-bordered w-full bg-base-100" />
                                            <input type="text" placeholder="Level Group (e.g. Level 200)" value={courseForm.level} onChange={e => setCourseForm({ ...courseForm, level: e.target.value })} className="input input-bordered w-full bg-base-100" />
                                            <select value={courseForm.lecturer} onChange={e => setCourseForm({ ...courseForm, lecturer: e.target.value })} className="select select-bordered w-full bg-base-100">
                                                <option value="">Select Assigned Instructor</option>
                                                {lecturers.map(l => <option key={l._id} value={l._id}>{l.name} ({l.department})</option>)}
                                            </select>
                                            <input type="number" placeholder="Weekly Required Hours" value={courseForm.weeklyHours} onChange={e => setCourseForm({ ...courseForm, weeklyHours: parseInt(e.target.value) })} className="input input-bordered w-full bg-base-100" />
                                            <button onClick={() => handleAddItem("/api/admin/courses", courseForm, () => setCourseForm({ code: "", title: "", department: "", level: "", lecturer: "", weeklyHours: 3 }))} className="btn btn-primary btn-block text-white rounded-xl">Save Course</button>
                                        </div>
                                        {/* Inventory Datatable */}
                                        <div className="lg:col-span-2 overflow-x-auto">
                                            <table className="table table-zebra w-full">
                                                <thead><tr className="text-white font-bold"><th>Code</th><th>Course Title</th><th>Target Level</th><th>Lecturer</th><th>Actions</th></tr></thead>
                                                <tbody>
                                                    {courses.map((crs) => (
                                                        <tr key={crs._id}>
                                                            <td className="font-bold text-primary">{crs.code}</td>
                                                            <td>{crs.title}</td>
                                                            <td>{crs.level}</td>
                                                            <td>{crs.lecturer?.name || "Unassigned"}</td>
                                                            <td><button onClick={() => handleDeleteItem("/api/admin/courses", crs._id)} className="btn btn-ghost btn-xs text-error"><Trash2 size={16} /></button></td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* VENUES VIEW TAB */}
                                {activeTab === "venues" && (
                                    <div className="grid lg:grid-cols-3 gap-6">
                                        <div className="bg-base-200 p-5 rounded-2xl border border-base-300 space-y-3 h-fit">
                                            <h4 className="font-bold text-white flex items-center gap-2"><Plus className="w-4 h-4" /> Add Lecture Venue</h4>
                                            <input type="text" placeholder="Venue Identity (Room 4B)" value={venueForm.name} onChange={e => setVenueForm({ ...venueForm, name: e.target.value })} className="input input-bordered w-full bg-base-100" />
                                            <input type="number" placeholder="Seating Capacity" value={venueForm.capacity} onChange={e => setVenueForm({ ...venueForm, capacity: e.target.value })} className="input input-bordered w-full bg-base-100" />
                                            <button onClick={() => handleAddItem("/api/admin/venues", venueForm, () => setVenueForm({ name: "", capacity: "" }))} className="btn btn-primary btn-block text-white rounded-xl">Save Venue</button>
                                        </div>
                                        <div className="lg:col-span-2 overflow-x-auto">
                                            <table className="table table-zebra w-full">
                                                <thead><tr className="text-white font-bold"><th>Room Name</th><th>Max Seating Capacity</th><th>Actions</th></tr></thead>
                                                <tbody>
                                                    {venues.map((vn) => (
                                                        <tr key={vn._id}>
                                                            <td className="font-semibold text-primary">{vn.name}</td>
                                                            <td>{vn.capacity} students</td>
                                                            <td><button onClick={() => handleDeleteItem("/api/admin/venues", vn._id)} className="btn btn-ghost btn-xs text-error"><Trash2 size={16} /></button></td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* CURRENT SCHEDULE GENERATION SLOTS TAB */}
                                {activeTab === "schedule" && (
                                    <div className="space-y-4">
                                        <h3 className="text-xl font-bold text-white">Master Calendar Allocations Matrix</h3>
                                        {timetables.length === 0 ? (
                                            <div className="text-center py-12 text-base-content/50">No schedules map allocated yet. Supply parameter constraints and click <b>Generate Timetable</b> above.</div>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <table className="table table-zebra w-full">
                                                    <thead><tr className="text-white font-bold"><th>Day</th><th>Time Slot Period</th><th>Course Module</th><th>Assigned Venue</th><th>Instructor</th></tr></thead>
                                                    <tbody>
                                                        {timetables.map((slot) => (
                                                            <tr key={slot._id}>
                                                                <td className="font-bold text-white">{slot.day}</td>
                                                                <td><span className="badge badge-primary text-white font-semibold">{slot.period}</span></td>
                                                                <td><span className="font-bold">{slot.courseId?.code}</span> - {slot.courseId?.title} ({slot.courseId?.level})</td>
                                                                <td><span className="badge badge-accent font-bold">{slot.venueId?.name}</span></td>
                                                                <td>{slot.courseId?.lecturer?.name || "Staff"}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                </div>
            </div>
        </>

    );
}