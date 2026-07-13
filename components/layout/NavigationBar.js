"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { CalendarDays, LayoutDashboard, ShieldCheck, User, LogOut, UserPlus } from "lucide-react";
import Image from "next/image";

export default function NavigationBar() {
  const { data: session } = useSession(); // Removed { required: true } to prevent forcing redirect on public homepage
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled
        ? "bg-base-100/95 backdrop-blur-md shadow-md border-b border-base-200"
        : "bg-transparent shadow-none"
        }`}
    >
      <div className={`flex justify-between items-center px-6 md:px-10 transition-all duration-300 ${scrolled ? "py-3" : "py-5"
        }`}>

        {/* Logo Branding */}
        <Link href="/">
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="bg-white/10 p-2 rounded-xl text-primary transition-colors group-hover:bg-white/20">
              {/* <CalendarDays className="w-5 h-5" /> */}

              <Image
                className=""
                src="/images/KNUST_logo.png"
                alt="KNUST logo"
                width={25}
                height={50}
                priority
              />
            </div>
            <span className="text-base md:text-lg font-black text-white tracking-tight">
              KNUST, Elec. & Comp. Eng. 
            </span>
          </div>
        </Link>

        {/* Dynamic Auth Menu Shell */}
        <div>
          {session ? (
            <div className="dropdown dropdown-end">
              {/* Profile Avatar Trigger Button */}
              <label
                tabIndex={0}
                className="btn btn-ghost btn-circle avatar placeholder bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all"
              >
                <div className="text-primary font-bold text-xs uppercase">
                  {session.user?.name ? session.user.name.substring(0, 2) : "US"}
                </div>
              </label>

              {/* Profile Context Dropdown List */}
              <div
                tabIndex={0}
                className="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-2xl w-72 mt-2 border border-base-200 animate-fadeIn"
              >
                {/* User Info Header Block */}
                <div className="flex justify-between items-center px-4 py-3 border-b border-base-200 mb-1">
                  <div className="max-w-[80%]">
                    <div className="font-bold text-primary truncate">{session.user?.name}</div>
                    <div className="text-xs text-base-content/60 truncate">{session.user?.email}</div>
                  </div>
                  {session.user?.role === "admin" ? (
                    <ShieldCheck className="w-5 h-5 text-success" />
                  ) : (
                    <User className="w-5 h-5 text-info" />
                  )}
                </div>

                {/* Role-Based Route Navigation Links */}
                {session.user?.role === "lecturer" && (
                  <li>
                    <Link
                      href="/dashboard"
                      className={`flex items-center gap-3 rounded-xl py-2.5 ${pathname === "/dashboard" ? "active bg-primary text-white" : "text-gray-500"
                        }`}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span className="font-medium">Lecturer Dashboard</span>
                    </Link>
                  </li>
                )}

                {session.user?.role === "admin" && (
                  <>
                    <li>
                      <Link
                        href="/admin"
                        className={`flex items-center gap-3 rounded-xl py-2.5
                      ${pathname === "/admin" ? "active bg-primary text-white" : "text-gray-500"}`}
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span className="font-medium">Admin Dashboard</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/sign-up"
                        className={`flex items-center gap-3 rounded-xl py-2.5
                      ${pathname === "/sign-up" ? "active bg-primary text-white" : "text-gray-500"}`}
                      >
                        <UserPlus className="w-4 h-4" />
                        <span className="font-medium">Sign up user</span>
                      </Link>
                    </li>
                  </>
                )}

                {/* App Sign Out Action Trigger */}
                <div className="border-t border-base-200 mt-1 pt-1">
                  <li>
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="flex items-center gap-3 rounded-xl py-2.5 text-error hover:bg-error/10 font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </li>
                </div>
              </div>
            </div>
          ) : (
            // Public Session Visitor Link Block
            <Link
              href="/sign-in"
              className="btn btn-primary btn-sm md:btn-md rounded-full px-6 text-white font-semibold shadow-sm"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}