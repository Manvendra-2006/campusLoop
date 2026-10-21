import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import { Loader2, Edit, RefreshCw, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [noteComplaintId, setNoteComplaintId] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [filters, setFilters] = useState({ status: '', priority: '', department: '', search: '' });
  const limit = 10;

  const fetchComplaints = async (pageNum = 1, currentFilters = filters) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: pageNum,
        limit,
        ...(currentFilters.status && { status: currentFilters.status }),
        ...(currentFilters.priority && { priority: currentFilters.priority }),
        ...(currentFilters.department && { department: currentFilters.department }),
        ...(currentFilters.search && { search: currentFilters.search })
      }).toString();
      const res = await api.get(`/admin/complaints?${query}`);
      setComplaints(res.data.complaints);
      setTotal(res.data.total);
      setPage(pageNum);
    } catch (err) {
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const totalPages = Math.ceil(total / limit);

  const handlePatch = async (id, field, value) => {
    try {
      const payload = { [field]: value };
      const url = `/admin/complaints/${id}/${field}`; // field is status, priority, department
      await api.patch(url, payload);
      toast.success('Updated');
      fetchComplaints(page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const handleAddNote = async (event) => {
    event.preventDefault();
    const note = noteText.trim();
    if (!note || !noteComplaintId) return;
    setSavingNote(true);
    try {
      await api.post(`/admin/complaints/${noteComplaintId}/notes`, { note });
      toast.success('Note added');
      setNoteComplaintId(null);
      setNoteText('');
      fetchComplaints(page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add note');
    } finally {
      setSavingNote(false);
    }
  };

  const handleAI = async (id) => {
    try {
      await api.post(`/admin/complaints/${id}/analyze`);
      toast.success('AI analysis finished');
      fetchComplaints(page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI analysis failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">CASE MANAGEMENT</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">All complaints</h1>
        <p className="mt-1 text-sm text-slate-500">Review submissions, update progress, and follow up with students.</p>
      </div>
      {/* Filters */}
      <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 xl:grid-cols-5">
        <label className="relative">
          <span className="sr-only">Search complaints</span>
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm"
            placeholder="Search complaints"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </label>
        <select
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Statuses</option>
          <option>Pending</option>
          <option>In Progress</option>
          <option>Resolved</option>
          <option>Rejected</option>
        </select>
        <select
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          value={filters.priority}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
        >
          <option value="">All Priorities</option>
          <option>Urgent</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
        <input
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="Department"
          value={filters.department}
          onChange={(e) => setFilters({ ...filters, department: e.target.value })}
        />
        <button
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          onClick={() => fetchComplaints(1, filters)}
        >
          Apply Filters
        </button>
      </div>

      {complaints.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-14 text-center text-sm text-slate-500">No complaints match these filters.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Complaint</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Priority</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Department</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Submitted</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {complaints.map((c) => (
              <tr key={c._id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link to={`/admin/complaints/${c._id}`} className="text-primary underline">
                    <span className="block font-medium text-slate-900 no-underline">{c.title}</span>
                  </Link>
                  <span className="mt-1 block text-xs text-slate-500">{c.createdBy?.name || 'Student'} · {c.category || 'General'}</span>
                </td>
                <td className="px-4 py-3">
                  <select
                    aria-label={`Status for ${c.title}`}
                    className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                    defaultValue={c.status}
                    onChange={(e) => {
                      if (e.target.value !== c.status) handlePatch(c._id, 'status', e.target.value);
                    }}
                  >
                    <option>Pending</option>
                    <option>In Progress</option>
                    <option>Resolved</option>
                    <option>Rejected</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <select
                    aria-label={`Priority for ${c.title}`}
                    className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                    defaultValue={c.priority || ''}
                    onChange={(e) => {
                      if (e.target.value && e.target.value !== c.priority) handlePatch(c._id, 'priority', e.target.value);
                    }}
                  >
                    <option value="">—</option>
                    <option>Urgent</option>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <input
                    aria-label={`Department for ${c.title}`}
                    className="w-32 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                    defaultValue={c.department || ''}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.currentTarget.blur();
                      }
                    }}
                    onBlur={(e) => {
                      const department = e.target.value.trim();
                      if (department && department !== (c.department || '')) handlePatch(c._id, 'department', department);
                    }}
                  />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <button
                    onClick={() => {
                      setNoteComplaintId(c._id);
                      setNoteText('');
                    }}
                    className="rounded-md p-2 text-slate-500 hover:bg-indigo-50 hover:text-indigo-700"
                    title="Add note"
                    aria-label={`Add an internal note to ${c.title}`}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleAI(c._id)}
                    className="rounded-md p-2 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"
                    title="Trigger AI analysis"
                  >
                    <RefreshCw size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          <button
            disabled={page === 1}
            onClick={() => fetchComplaints(page - 1, filters)}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span className="px-2 py-1">Page {page} of {totalPages}</span>
          <button
            disabled={page === totalPages}
            onClick={() => fetchComplaints(page + 1, filters)}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
      {noteComplaintId && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 p-4" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !savingNote) setNoteComplaintId(null);
        }}>
          <form onSubmit={handleAddNote} className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="note-title">
            <h2 id="note-title" className="text-lg font-semibold text-slate-900">Add internal note</h2>
            <p className="mt-1 text-sm text-slate-500">Only administrators can view this note.</p>
            <textarea
              autoFocus
              rows={5}
              value={noteText}
              onChange={(event) => setNoteText(event.target.value)}
              maxLength={2000}
              required
              placeholder="Write a note for the admin team…"
              className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
            <div className="mt-4 flex justify-end gap-3">
              <button type="button" disabled={savingNote} onClick={() => setNoteComplaintId(null)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Cancel</button>
              <button type="submit" disabled={savingNote || !noteText.trim()} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">{savingNote ? 'Saving…' : 'Save note'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminComplaints;
