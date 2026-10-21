import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock3, FilePlus2, FileText, Loader2, MessageSquareText } from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

const statusStyles = {
  Pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  'In Progress': 'bg-blue-50 text-blue-700 ring-blue-200',
  Resolved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Rejected: 'bg-rose-50 text-rose-700 ring-rose-200',
};

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api.get('/complaints/my/stats')
      .then(({ data }) => {
        if (active) setStats(data);
      })
      .catch((error) => {
        if (active) toast.error(error.response?.data?.message || 'Unable to load your dashboard');
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
    { label: 'All complaints', value: stats?.total || 0, icon: FileText, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Awaiting review', value: stats?.pending || 0, icon: Clock3, color: 'text-amber-600 bg-amber-50' },
    { label: 'Being handled', value: stats?.inProgress || 0, icon: MessageSquareText, color: 'text-blue-600 bg-blue-50' },
    { label: 'Resolved', value: stats?.resolved || 0, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Closed', value: stats?.rejected || 0, icon: FileText, color: 'text-rose-600 bg-rose-50' },
  ];

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-5 rounded-2xl bg-gradient-to-r from-indigo-700 to-violet-600 p-6 text-white shadow-sm sm:flex-row sm:items-center sm:p-8">
        <div>
          <p className="text-sm font-medium text-indigo-100">STUDENT PORTAL</p>
          <h1 className="mt-2 text-3xl font-bold">Welcome back, {user?.name?.split(' ')[0] || 'Student'}</h1>
          <p className="mt-2 max-w-xl text-indigo-100">Track your campus requests and stay up to date as the team works on them.</p>
        </div>
        <Link to="/student/submit" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-50">
          <FilePlus2 size={18} /> Submit a complaint
        </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
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

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="font-semibold text-slate-900">Recent complaints</h2>
            <p className="mt-1 text-sm text-slate-500">The latest updates on your submissions.</p>
          </div>
          <Link to="/student/complaints" className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-700 hover:text-indigo-900">
            View all <ArrowRight size={16} />
          </Link>
        </div>
        {!stats?.recentComplaints?.length ? (
          <div className="px-5 py-12 text-center">
            <FileText className="mx-auto text-slate-300" size={36} />
            <p className="mt-3 font-medium text-slate-800">No complaints submitted yet</p>
            <p className="mt-1 text-sm text-slate-500">Submit a request and it will appear here.</p>
            <Link to="/student/submit" className="mt-4 inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Create complaint</Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {stats.recentComplaints.map((complaint) => (
              <Link key={complaint._id} to={`/student/complaints/${complaint._id}`} className="flex flex-col gap-3 px-5 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">{complaint.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{complaint.category || 'General'} · {new Date(complaint.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles[complaint.status] || 'bg-slate-100 text-slate-700 ring-slate-200'}`}>{complaint.status}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default StudentDashboard;
