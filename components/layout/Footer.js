
export default function Footer() {
    return (
        <>
            {/* Footer */}
            <footer className="footer footer-center p-4 bg-base-200 text-slate-500 text-xs">
                <div>
                    <p>© {new Date().getFullYear()} - KNUST, FECE Auto Timetable Portal</p>
                </div>
            </footer>
        </>
    )
}