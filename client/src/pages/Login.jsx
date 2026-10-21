import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      const user = await login(data);
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
        <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">CampusLoop · Student portal</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-500">Sign in to submit and track campus complaints.</p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-5">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input id="email" type="email" autoComplete="email" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100" {...register('email', { required: 'Email is required' })} />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <input id="password" type="password" autoComplete="current-password" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100" {...register('password', { required: 'Password is required' })} />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full rounded-lg bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">New to CampusLoop? <Link to="/register" className="font-semibold text-indigo-700 hover:underline">Create an account</Link></p>
        <p className="mt-3 text-center text-sm text-slate-500"><Link to="/admin/login" className="hover:text-indigo-700">Administrator sign in</Link></p>
      </div>
    </div>
  );
};

export default Login;
