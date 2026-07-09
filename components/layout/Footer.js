
export default function Footer() {
    return (
        <>
            {/* Footer */}
            <footer className="footer footer-center p-4 bg-base-200 text-slate-500 text-xs">
                <div>
                    <p>© {new Date().getFullYear()} - Departmental Timetable Generator MVP</p>
                </div>
            </footer>
        </>
    )
}