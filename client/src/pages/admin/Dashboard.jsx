import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, AlertTriangle, ArrowRight, CheckCircle2, Clock3, FileText, Loader2 } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import toast from 'react-hot-toast';
import api from '../../services/api';

const chartColors = ['#6366f1', '#f59e0b', '#10b981', '#f43f5e'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([
      api.get('/admin/complaints/stats'),
      api.get('/admin/complaints?page=1&limit=6'),
    ])
      .then(([statsResponse, complaintsResponse]) => {
        if (!active) return;
        setStats(statsResponse.data);
        setRecentComplaints(complaintsResponse.data.complaints);
      })
      .catch((error) => {
        if (active) toast.error(error.response?.data?.message || 'Unable to load the admin dashboard');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  if (loading) {
    return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>;
  }

  const cards = [
    { label: 'Total complaints', value: stats?.total || 0, icon: FileText, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Awaiting review', value: stats?.pending || 0, icon: Clock3, color: 'bg-amber-50 text-amber-600' },
    { label: 'In progress', value: stats?.inProgress || 0, icon: Activity, color: 'bg-blue-50 text-blue-600' },
    { label: 'Urgent priority', value: stats?.urgent || 0, icon: AlertTriangle, color: 'bg-rose-50 text-rose-600' },
  ];
  const statusData = (stats?.byStatus || []).filter((item) => item._id);

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-4 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-900 p-6 text-white sm:flex-row sm:items-center sm:p-8">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-indigo-200">ADMINISTRATION</p>
          <h1 className="mt-2 text-3xl font-bold">Complaint overview</h1>
          <p className="mt-2 text-slate-300">Monitor campus concerns and keep requests moving toward resolution.</p>
        </div>
        <Link to="/admin/complaints" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 font-semibold text-slate-900 hover:bg-indigo-50">
          Manage complaints <ArrowRight size={17} />
        </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <span className={`rounded-lg p-2 ${color}`}><Icon size={19} /></span>
            </div>
            <p className="mt-4 text-3xl font-bold text-slate-900">{value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.8fr)]">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900">Status distribution</h2>
          <p className="mt-1 text-sm text-slate-500">Current workload by complaint status.</p>
          {statusData.length ? (
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="count" nameKey="_id" cx="50%" cy="50%" innerRadius={58} outerRadius={92} paddingAngle={3}>
                    {statusData.map((entry, index) => <Cell key={entry._id} fill={chartColors[index % chartColors.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-slate-600">
                {statusData.map((entry, index) => (
                  <span key={entry._id} className="inline-flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: chartColors[index % chartColors.length] }} />
                    {entry._id}: {entry.count}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center text-slate-400">
              <CheckCircle2 size={36} />
              <p className="mt-3 text-sm">No complaint data available yet.</p>
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="font-semibold text-slate-900">Latest submissions</h2>
              <p className="mt-1 text-sm text-slate-500">Recently reported concerns.</p>
            </div>
            <Link to="/admin/complaints" aria-label="View all complaints" className="rounded-lg p-2 text-indigo-700 hover:bg-indigo-50"><ArrowRight size={18} /></Link>
          </div>
          {recentComplaints.length ? (
            <div className="divide-y divide-slate-100">
              {recentComplaints.map((complaint) => (
                <Link key={complaint._id} to={`/admin/complaints/${complaint._id}`} className="block px-5 py-4 hover:bg-slate-50">
                  <p className="truncate font-medium text-slate-900">{complaint.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{complaint.createdBy?.name || 'Student'} · {new Date(complaint.createdAt).toLocaleDateString()}</p>
                  <span className="mt-2 inline-block rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{complaint.status}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="px-5 py-12 text-center text-sm text-slate-500">There are no complaints to display.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
