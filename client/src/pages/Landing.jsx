import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowRight, CheckCircle2, Clock3, ShieldCheck } from 'lucide-react';

const Landing = () => (
  <div className="min-h-screen bg-slate-50 text-slate-900">
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link to="/" className="flex items-center gap-2 font-bold">
          <span className="rounded-xl bg-indigo-600 p-2 text-white"><Activity size={20} /></span>
          <span className="text-lg">CampusLoop</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/login" className="hidden text-sm font-semibold text-slate-600 hover:text-indigo-700 sm:inline">Student sign in</Link>
          <Link to="/admin/login" className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Admin portal</Link>
        </div>
      </div>
    </header>
    <main>
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-indigo-700">
            <span className="h-2 w-2 rounded-full bg-indigo-500" /> Campus support, connected
          </span>
          <h1 className="mt-6 max-w-2xl text-4xl font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl">
            A better way to make your campus <span className="text-indigo-600">work for everyone.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
            Report campus issues, follow every update, and help your community get the support it needs.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/register" className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white shadow-sm hover:bg-indigo-700">
              Create a student account <ArrowRight size={17} />
            </Link>
            <Link to="/login" className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-center font-semibold text-slate-700 hover:bg-slate-50">Student sign in</Link>
          </div>
          <p className="mt-4 text-sm text-slate-500">Campus administrator? <Link to="/admin/login" className="font-semibold text-indigo-700 hover:underline">Go to admin sign in</Link></p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">How CampusLoop helps</p>
          <div className="mt-6 space-y-5">
            {[
              { icon: ShieldCheck, title: 'One place to report', text: 'Share the details and location so the right team can respond.' },
              { icon: Clock3, title: 'Clear status updates', text: 'Follow your request from review through resolution.' },
              { icon: CheckCircle2, title: 'Accountable follow-up', text: 'Campus administrators can prioritize and manage every case.' },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-4 rounded-xl bg-slate-50 p-4">
                <span className="h-fit rounded-lg bg-indigo-50 p-2 text-indigo-600"><Icon size={20} /></span>
                <div><h2 className="font-semibold text-slate-900">{title}</h2><p className="mt-1 text-sm leading-6 text-slate-600">{text}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <span>CampusLoop · Campus support made clear.</span>
        <span>Student access · Administrator access</span>
      </div>
    </footer>
  </div>
);

export default Landing;
