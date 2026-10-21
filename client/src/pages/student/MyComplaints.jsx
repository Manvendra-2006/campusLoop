import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FilePlus2, Loader2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const badgeStyles = {
  Pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  'In Progress': 'bg-blue-50 text-blue-700 ring-blue-200',
  Resolved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Rejected: 'bg-rose-50 text-rose-700 ring-rose-200',
};

const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', search: '' });
  const [appliedFilters, setAppliedFilters] = useState({ status: '', search: '' });
  const limit = 10;

  const fetchComplaints = useCallback(async (pageNum, currentFilters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(pageNum), limit: String(limit) });
      if (currentFilters.status) params.set('status', currentFilters.status);
      if (currentFilters.search.trim()) params.set('search', currentFilters.search.trim());
      const { data } = await api.get(`/complaints/my?${params.toString()}`);
      setComplaints(data.complaints);
      setTotal(data.total);
      setPage(pageNum);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load your complaints');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComplaints(1, { status: '', search: '' });
  }, [fetchComplaints]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">YOUR REQUESTS</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">My complaints</h1>
          <p className="mt-1 text-sm text-slate-500">Track status and review updates from the campus team.</p>
        </div>
        <Link to="/student/submit" className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
          <FilePlus2 size={17} /> New complaint
        </Link>
      </div>

      <section className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Search complaints</span>
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
            placeholder="Search title or description"
            className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </label>
        <select
          aria-label="Filter by status"
          value={filters.status}
          onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option>Pending</option>
          <option>In Progress</option>
          <option>Resolved</option>
          <option>Rejected</option>
        </select>
        <button onClick={() => {
          setAppliedFilters(filters);
          fetchComplaints(1, filters);
        }} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Apply filters</button>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex min-h-64 items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={30} /></div>
        ) : complaints.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <p className="font-medium text-slate-800">No complaints found</p>
            <p className="mt-1 text-sm text-slate-500">{filters.search || filters.status ? 'Try changing your filters.' : 'When you submit a complaint, it will appear here.'}</p>
            {!filters.search && !filters.status && <Link to="/student/submit" className="mt-4 inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Submit your first complaint</Link>}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Complaint</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Location</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {complaints.map((complaint) => (
                    <tr key={complaint._id} className="hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <Link to={`/student/complaints/${complaint._id}`} className="font-medium text-indigo-700 hover:text-indigo-900">{complaint.title}</Link>
                        <p className="mt-1 text-xs text-slate-500">{complaint.category || 'General'}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">{complaint.location?.building}{complaint.location?.room ? ` · ${complaint.location.room}` : ''}</td>
                      <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${badgeStyles[complaint.status] || 'bg-slate-100 text-slate-700 ring-slate-200'}`}>{complaint.status}</span></td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">{new Date(complaint.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-sm text-slate-600">
              <span>{total} total</span>
              {totalPages > 1 && (
                <div className="flex items-center gap-3">
                  <button disabled={page === 1} onClick={() => fetchComplaints(page - 1, appliedFilters)} className="rounded-md border border-slate-300 px-3 py-1.5 disabled:opacity-40">Previous</button>
                  <span>Page {page} of {totalPages}</span>
                  <button disabled={page === totalPages} onClick={() => fetchComplaints(page + 1, appliedFilters)} className="rounded-md border border-slate-300 px-3 py-1.5 disabled:opacity-40">Next</button>
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default MyComplaints;
