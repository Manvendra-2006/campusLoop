import React, { useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, FileText, Loader2, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const statusStyles = {
  Pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  'In Progress': 'bg-blue-50 text-blue-700 ring-blue-200',
  Resolved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Rejected: 'bg-rose-50 text-rose-700 ring-rose-200',
};

const ComplaintDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api.get(`/complaints/${id}`)
      .then(({ data }) => {
        if (active) setComplaint(data.complaint);
      })
      .catch((error) => {
        if (active) toast.error(error.response?.data?.message || 'Unable to load this complaint');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [id]);

  if (loading) {
    return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={30} /></div>;
  }

  const backPath = isAdmin ? '/admin/complaints' : '/student/complaints';
  if (!complaint) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
        <p className="font-semibold text-slate-800">Complaint not found</p>
        <Link to={backPath} className="mt-3 inline-block text-sm font-semibold text-indigo-700 hover:underline">Return to complaints</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <Link to={backPath} className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-700">
        <ArrowLeft size={16} /> {isAdmin ? 'Back to all complaints' : 'Back to my complaints'}
      </Link>
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles[complaint.status] || 'bg-slate-100 text-slate-700 ring-slate-200'}`}>{complaint.status}</span>
            {complaint.priority && <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700 ring-1 ring-inset ring-violet-200">{complaint.priority} priority</span>}
            {complaint.category && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{complaint.category}</span>}
          </div>
          <h1 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl">{complaint.title}</h1>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5"><CalendarDays size={15} /> Submitted {new Date(complaint.createdAt).toLocaleString()}</span>
            <span className="inline-flex items-center gap-1.5"><MapPin size={15} /> {complaint.location?.building}{complaint.location?.room ? ` · ${complaint.location.room}` : ''}</span>
          </div>
          {isAdmin && complaint.createdBy && (
            <p className="mt-3 text-sm text-slate-500">
              Submitted by <span className="font-medium text-slate-700">{complaint.createdBy.name}</span>
              {complaint.createdBy.email ? ` · ${complaint.createdBy.email}` : ''}
              {complaint.createdBy.studentId ? ` · ID ${complaint.createdBy.studentId}` : ''}
            </p>
          )}
        </div>
        <div className="space-y-7 p-6 sm:p-8">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Description</h2>
            <p className="mt-2 whitespace-pre-wrap leading-7 text-slate-700">{complaint.description}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Assigned department</p>
              <p className="mt-1 font-medium text-slate-900">{complaint.department || 'Not assigned yet'}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Priority</p>
              <p className="mt-1 font-medium text-slate-900">{complaint.priority || 'Not assessed yet'}</p>
            </div>
          </div>
          {complaint.attachments?.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Attachments</h2>
              <div className="mt-3 flex flex-wrap gap-3">
                {complaint.attachments.map((attachment) => (
                  <a key={attachment.filename} href={attachment.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50">
                    <FileText size={16} /> {attachment.filename}
                  </a>
                ))}
              </div>
            </div>
          )}
          {complaint.statusHistory?.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Status updates</h2>
              <ol className="mt-3 space-y-3 border-l-2 border-slate-200 pl-4">
                {[...complaint.statusHistory].reverse().map((entry) => (
                  <li key={`${entry._id || entry.changedAt}-${entry.newStatus}`} className="relative">
                    <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-indigo-500 ring-4 ring-white" />
                    <p className="text-sm font-medium text-slate-800">{entry.oldStatus || 'Created'} → {entry.newStatus}</p>
                    {entry.note && <p className="mt-1 text-sm text-slate-600">{entry.note}</p>}
                    <p className="mt-1 text-xs text-slate-400">{new Date(entry.changedAt).toLocaleString()}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}
          {isAdmin && complaint.adminNotes?.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Internal admin notes</h2>
              <div className="mt-3 space-y-3">
                {complaint.adminNotes.map((entry) => (
                  <div key={entry._id || entry.createdAt} className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <p className="whitespace-pre-wrap text-sm text-slate-700">{entry.note}</p>
                    <p className="mt-2 text-xs text-slate-500">{entry.author?.name || 'Administrator'} · {new Date(entry.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ComplaintDetail;
