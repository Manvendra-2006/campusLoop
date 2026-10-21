import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Register = () => {
  const { register: registerUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { role: 'student' },
  });
  const role = watch('role');

  const onSubmit = async (data) => {
    try {
      const user = await registerUser(data);
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
        <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">CampusLoop</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Create your account</h1>
        <p className="mt-1 text-sm text-slate-500">Choose an account type to get started.</p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4">
          <div>
            <label htmlFor="role" className="mb-1 block text-sm font-medium text-slate-700">Account type</label>
            <select id="role" className="w-full rounded-lg border border-slate-300 px-3 py-2.5" {...register('role')}>
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">Full name</label>
            <input id="name" autoComplete="name" className="w-full rounded-lg border border-slate-300 px-3 py-2.5" {...register('name', { required: 'Name is required' })} />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input id="email" type="email" autoComplete="email" className="w-full rounded-lg border border-slate-300 px-3 py-2.5" {...register('email', { required: 'Email is required' })} />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>
          {role === 'student' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="studentId" className="mb-1 block text-sm font-medium text-slate-700">Student ID (optional)</label>
                <input id="studentId" className="w-full rounded-lg border border-slate-300 px-3 py-2.5" {...register('studentId')} />
              </div>
              <div>
                <label htmlFor="department" className="mb-1 block text-sm font-medium text-slate-700">Department (optional)</label>
                <input id="department" className="w-full rounded-lg border border-slate-300 px-3 py-2.5" {...register('department')} />
              </div>
            </div>
          )}
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <input id="password" type="password" autoComplete="new-password" className="w-full rounded-lg border border-slate-300 px-3 py-2.5" {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Use at least 8 characters' } })} />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          Already registered? <Link to="/login" className="font-semibold text-indigo-700 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
