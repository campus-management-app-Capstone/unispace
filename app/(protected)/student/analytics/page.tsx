"use client";

export default function StudentAnalyticsPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">

      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark/50 flex flex-col justify-between p-4">

        <div className="flex flex-col gap-8">

          {/* Logo */}
          <div className="flex items-center gap-3 px-2">
            <div className="size-10 bg-primary rounded-xl flex items-center justify-center text-white">
              <span className="material-symbols-outlined">analytics</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-primary">
              EduPulse
            </h2>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-1">

            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-primary text-white">
              <span className="material-symbols-outlined">dashboard</span>
              <p className="text-sm font-semibold">Dashboard</p>
            </div>

            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600">
              <span className="material-symbols-outlined">book_2</span>
              <p className="text-sm font-medium">Courses</p>
            </div>

            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600">
              <span className="material-symbols-outlined">school</span>
              <p className="text-sm font-medium">Grades</p>
            </div>

            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600">
              <span className="material-symbols-outlined">fact_check</span>
              <p className="text-sm font-medium">Attendance</p>
            </div>

            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600">
              <span className="material-symbols-outlined">calendar_month</span>
              <p className="text-sm font-medium">Schedule</p>
            </div>

          </nav>
        </div>

        {/* Profile */}
        <div className="p-2">
          <div className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-800/50 rounded-xl">

            <div
              className="size-10 rounded-full bg-cover bg-center border-2 border-primary/20"
              style={{
                backgroundImage:
                  "url(https://lh3.googleusercontent.com/aida-public/AB6AXuA9sfVhPhRxT_ZjYBswkhwNtU0BHdz-d9VfFONLkZv3gicW8gHyKiBSwcYj2ykE8KlifNBACJA3o0jrhICIrsUApSORmZQNabrabxQ4l12K1RqZV18ubxhSZjnTFkHM382Li74ofgwG0RHTStSU9el2CpO9lKxBZMPXH-fdChW8hwZnrZDf8JKVxfRCD-QF5wAdQce3RcF_dBmO0PyeI6VlulHXzxQPRxqojynqxiWX9c3bj6GJmEgCjlkkvwPQn8NWarc8T_i3a-4)"
              }}
            />

            <div className="flex flex-col overflow-hidden">
              <h1 className="text-sm font-bold truncate">Alex Johnson</h1>
              <p className="text-xs text-slate-500 truncate">
                Computer Science Senior
              </p>
            </div>

          </div>
        </div>

      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">

        {/* Header */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-8 flex items-center justify-between">

          <div className="relative w-full max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              search
            </span>

            <input
              type="text"
              placeholder="Search analytics, courses..."
              className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="flex items-center gap-3">

            <button className="size-10 flex items-center justify-center rounded-xl hover:bg-slate-100">
              <span className="material-symbols-outlined">
                notifications
              </span>
            </button>

            <button className="size-10 flex items-center justify-center rounded-xl hover:bg-slate-100">
              <span className="material-symbols-outlined">
                settings
              </span>
            </button>

            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              AJ
            </div>

          </div>

        </header>

        {/* Content */}
        <div className="p-8 flex flex-col gap-8 max-w-[1400px] mx-auto w-full">

          <div>
            <h1 className="text-3xl font-black tracking-tight mb-2">
              Academic Overview
            </h1>
            <p className="text-slate-500">
              Welcome back, Alex. Here's what's happening with your studies
              this week.
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* CGPA */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">

              <p className="text-sm font-semibold text-slate-500 uppercase">
                Overall CGPA
              </p>

              <h2 className="text-4xl font-black mt-1">
                3.85
                <span className="text-sm text-green-500 ml-2">
                  +0.12%
                </span>
              </h2>

            </div>

            {/* Attendance */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center justify-center">

              <p className="text-sm font-semibold text-slate-500 uppercase">
                Attendance
              </p>

              <h2 className="text-4xl font-black mt-4">
                94%
              </h2>

              <p className="text-xs text-green-500">
                +2.4%
              </p>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}