import React, { useContext } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Activity, ClipboardList, LayoutDashboard, LogOut, PlusCircle, UserRound } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const PortalLayout = ({ role }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const isAdmin = role === 'admin';
  const links = isAdmin
    ? [{ to: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
      { to: '/admin/complaints', label: 'Complaints', icon: ClipboardList }]
    : [{ to: '/student/dashboard', label: 'Overview', icon: LayoutDashboard },
      { to: '/student/complaints', label: 'My complaints', icon: ClipboardList },
      { to: '/student/submit', label: 'New complaint', icon: PlusCircle },
      { to: '/student/profile', label: 'Profile', icon: UserRound }];

  const handleLogout = async () => {
    try {
      await logout();
      navigate(isAdmin ? '/admin/login' : '/login', { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to sign out. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to={isAdmin ? '/admin/dashboard' : '/student/dashboard'} className="flex items-center gap-2 font-bold text-slate-900">
            <span className="rounded-xl bg-indigo-600 p-2 text-white"><Activity size={20} /></span>
            <span>CampusLoop<span className="ml-2 hidden text-xs font-medium uppercase tracking-wider text-slate-500 sm:inline">{role} portal</span></span>
          </Link>
          <nav aria-label="Main navigation" className="flex items-center gap-1">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end
                className={({ isActive }) => `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon size={17} />
                <span className="hidden sm:inline">{label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">{user?.name || 'Account'}</p>
              <p className="text-xs capitalize text-slate-500">{role}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        <Outlet />
      </main>
    </div>
  );
};

export default PortalLayout;
