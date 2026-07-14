
export default function Footer() {
    return (
        <>
            {/* Footer */}
            <footer className="footer footer-center p-4 bg-white text-gray-500 text-xs">
                <div>
                    <p>© {new Date().getFullYear()} - KNUST, FECE Auto Timetable Portal</p>
                </div>
            </footer>
        </>
    )
}