"use client"

import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

const MegaphoneIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 11l19-9-9 19-2-8-8-2z" />
  </svg>
)
const PlusIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
)
const SearchIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
)
const ChevronDownIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <path d="m6 9 6 6 6-6" />
  </svg>
)
const EditIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)
const TrashIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
  </svg>
)
const HomeIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)
const SpinnerIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
)
const CloseIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
)
const MenuIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
)

const TARGET_OPTIONS = ['', 'All', 'Class']

// create announcement
function CreateModal({ onClose, onSuccess }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)

    // Validation
    if (!title.trim() || !content.trim()) {
      toast.error("Please fill in all fields");
      setIsSaving(false);
      return;
    }

    const id = toast.loading("Adding ...");

    try {
      const response = await fetch("/api/announcement/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          target: "All"
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.update(id, {
          render: "Added Successfully",
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });
        const annID = result.data
        onSuccess({ annID, title, content }); // Only call success if it actually succeeded
      } else {
        toast.update(id, {
          render: "Failed to Add",
          type: "error",
          isLoading: false,
          autoClose: 2000,
        });
      }
    } catch (err) {
      console.error("Fetch crashed:", err);
      toast.update(id, {
        render: ("Add crashed:" + err.message),
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">Create New Announcement</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col overflow-y-auto">
          <div className="px-5 sm:px-6 py-5 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="m-title">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                id="m-title" type="text" required autoComplete="off"
                placeholder="e.g., Scheduled System Maintenance"
                value={title} onChange={e => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-800 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="m-content">
                Content <span className="text-red-500">*</span>
              </label>
              <textarea
                id="m-content" required rows={6}
                placeholder="Write your announcement message here..."
                value={content} onChange={e => setContent(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-800 transition-all resize-y"
              />
            </div>
          </div>

          {/* Form Actions: Stacked full width on Mobile, side-by-side on Desktop */}
          <div className="px-5 sm:px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 shrink-0">
            <button type="button" onClick={onClose}
              className="w-full sm:w-auto justify-center px-6 py-3 sm:py-2.5 text-sm font-semibold text-slate-600 border border-slate-300 rounded-xl hover:bg-white transition-colors cursor-pointer">
              Cancel
            </button>
            <button type="submit" disabled={isSaving}
              className="w-full sm:w-auto justify-center px-6 py-3 sm:py-2.5 text-sm font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer inline-flex items-center gap-2">
              {isSaving && <SpinnerIcon className="w-4 h-4 animate-spin" />}
              {isSaving ? 'Posting…' : 'Post Announcement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AnnouncementPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([])
  const [search, setSearch] = useState('')
  const [targetFilter, setTargetFilter] = useState('')
  const [showModal, setShowModal] = useState(false)

  const fetchAnnData = async () => {
    const id = toast.loading("Loading…");
    try {
      const response = await fetch("/api/announcement/get");
      const result = await response.json();

      if (response.ok && result.success) {
        setAnnouncements(result.data);
        toast.update(id, {
          render: "Loading completed",
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });
      } else {
        toast.update(id, {
          render: (result.error || "Failed to load details."),
          type: "error",
          isLoading: false,
          autoClose: 2000,
        });
      }
    } catch (err) {
      console.error("Fetch crashed:", err);
      toast.update(id, {
        render: "Failed to load details.",
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    }
    setIsLoading(false);
  }

  useEffect(() => {
    fetchAnnData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const filtered = (announcements || []).filter(a => {
    const q = search.toLowerCase()
    const matchSearch = a.Title?.toLowerCase().includes(q)
    const matchTarget = targetFilter === '' ? true : targetFilter === "All" && a.Target === "All" ? true : targetFilter === "Class" && a.Target !== "All" ? true : false
    return matchSearch && matchTarget
  })

  const handleSuccess = ({ annID, title }) => {
    const Target = "All";
    const next = {
      AnnouncementID: annID,
      Title: title,
      Target,
      CreatedAt: new Date().toISOString(),
    }
    setAnnouncements(prev => [next, ...prev])
    setShowModal(false)
  }

  const handleDelete = async (id) => {
    const needDlt = confirm("Are you sure to delete this announcement?");

    if(!needDlt){
      return;
    }

    console.log("Deleting: " + id);
    // Validation
    if (!id.trim()) {
      toast.error("Please pass in ID");
      return;
    }

    const dltID = toast.loading("Deleting ...");

    try {
      const response = await fetch("/api/announcement/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          annID: id
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.update(dltID, {
          render: "Deleted Successfully",
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });
        setAnnouncements(prev => prev.filter(a => a.AnnouncementID !== id))
      } else {
        toast.update(dltID, {
          render: "Failed to Delete.",
          type: "error",
          isLoading: false,
          autoClose: 2000,
        });
      }
    } catch (err) {
      console.error("Fetch crashed:", err);
      toast.update(dltID, {
        render: ("Delete crashed:" + err.message),
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    }
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'DM Sans', 'Helvetica Neue', Arial, sans-serif" }}>
      {/* ── Main ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* Heading row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight tracking-tight">
              Announcement Directory
            </h1>
            <p className="text-slate-500 text-sm sm:text-base mt-1.5">Manage and view all announcements on the platform.</p>
          </div>
          {/* Button is full width on mobile, auto width on desktop */}
          <button
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10 cursor-pointer shrink-0"
          >
            <PlusIcon className="w-5 h-5 sm:w-4 sm:h-4" />
            Add Announcement
          </button>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <p className="text-xs font-semibold text-slate-500 mb-2">Search</p>
            <div className="relative">
              <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search announcement..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 sm:py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-800 transition-all bg-white shadow-sm"
              />
            </div>
          </div>
          <div className="w-full sm:w-56">
            <p className="text-xs font-semibold text-slate-500 mb-2">Target</p>
            <div className="relative">
              <select
                value={targetFilter}
                onChange={e => setTargetFilter(e.target.value)}
                className="w-full appearance-none pl-4 pr-10 py-3 sm:py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-800 transition-all bg-white shadow-sm cursor-pointer"
              >
                {TARGET_OPTIONS.map(o => <option key={o} value={o}>{o || ''}</option>)}
              </select>
              <ChevronDownIcon className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Table Container - overflow-x-auto allows horizontal scroll on small screens */}
        <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm bg-white">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed min-w-[640px] text-sm">
              <thead className="bg-slate-50/50">
                <tr className="border-b border-slate-200">
                  {[
                    { label: 'Title', align: 'left' },
                    { label: 'Target', align: 'left' },
                    { label: 'Date Posted', align: 'left' },
                    { label: 'Actions', align: 'right' },
                  ].map(col => (
                    <th key={col.label}
                      // FIXED TAILWIND BUG: Using a ternary instead of text-${col.align}
                      className={`px-5 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-500 ${col.align === 'right' ? 'text-right' : 'text-left'}`}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-20 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <MegaphoneIcon className="w-8 h-8 text-slate-300" />
                        <span className="text-sm font-medium">No announcements found.</span>
                      </div>
                    </td>
                  </tr>
                ) : filtered.map(ann => (
                  <tr key={ann.AnnouncementID} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4 text-slate-900 font-medium max-w-[280px]">
                      <span className="line-clamp-2">{ann.Title}</span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                        {ann.Target}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500 whitespace-nowrap text-sm">
                      {new Date(ann.CreatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleDelete(ann.AnnouncementID)}
                          title="Delete Announcement"
                          className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {filtered.length > 0 && (
            <div className="px-5 py-4 border-t border-slate-100 bg-white flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Showing {filtered.length} of {announcements.length} entries</span>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && <CreateModal onClose={() => setShowModal(false)} onSuccess={handleSuccess} />}
    </div>
  )
}