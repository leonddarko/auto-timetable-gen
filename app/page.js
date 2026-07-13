"use client"

import Link from 'next/link';
import { CalendarDays, LogIn, ShieldAlert, UserPlus } from 'lucide-react';
import Footer from '@/components/layout/Footer';
import NavigationBar from '@/components/layout/NavigationBar';
import { signIn, useSession } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <>
      <NavigationBar />
      <div className="flex flex-col min-h-screen bg-base-200 font-sans text-base-content">

        {/* Hero Section */}
        <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-16">
          <div className="card max-w-2xl bg-base-100 shadow-xl border border-base-300 rounded-3xl">
            <div className="card-body items-center text-center p-8 md:p-12">

              {/* Project Welcome Icon */}
              <div className="bg-white/10 p-4 rounded-full text-white mb-2">
                <CalendarDays className="w-16 h-16" />
              </div>

              <p className="max-w-md text-sm text-base-content/70">
                Faculty of Electrical and Computer Engineering
              </p>

              <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">
                Automated Timetable Portal
              </h1>

              <p className="max-w-md text-sm text-base-content/70 mb-8">
                Welcome to your coursework scheduling platform. Generate conflict-free lecture hours or view assigned semester schedulesn.
              </p>


              {/* Quick Portal Selection Grid */}
              {!session && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">

                  {/* Sign In Option */}
                  <div className="flex flex-col justify-between items-center p-6 border border-base-200 rounded-3xl bg-base-50 hover:shadow-md transition">
                    <div className="flex flex-col items-center gap-2 mb-4">
                      <ShieldAlert className="w-8 h-8 text-primary" />
                      <h3 className="font-bold text-lg text-white">Sign In</h3>
                      <p className="text-xs text-base-content/60">
                        Log into your dashboard to access schedules or manage system resources.
                      </p>
                    </div>
                    <Link
                      href="/sign-in"
                      className="btn btn-primary btn-block rounded-full gap-2"
                    >
                      <LogIn className="w-4 h-4" />
                      Sign In
                    </Link>
                  </div>

                  {/* Temporary Sign Up Option */}
                  <div className="flex flex-col justify-between items-center p-6 border border-base-200 rounded-3xl bg-base-50 hover:shadow-md transition">
                    <div className="flex flex-col items-center gap-2 mb-4">
                      <UserPlus className="w-8 h-8 text-red-800" />
                      <h3 className="font-bold text-lg text-white">Sign Up</h3>
                      <p className="text-xs text-base-content/60">
                        Create an administrative account to configure the departmental database.
                      </p>
                    </div>
                    <Link
                      href="/sign-up"
                      className="btn btn-ghost btn-block bg-red-800 rounded-full gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      Sign Up
                    </Link>
                  </div>

                </div>
              )}


            </div>
          </div>
        </main>
      </div>
    </>
  );
}