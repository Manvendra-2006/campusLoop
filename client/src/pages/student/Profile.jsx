import React, { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, UserRound } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const StudentProfile = () => {
  const { user, loading, updateProfile } = useContext(AuthContext);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        studentId: user.studentId || '',
        department: user.department || '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const updates = { ...data };
      if (!updates.password) delete updates.password;
      await updateProfile(updates);
      toast.success('Profile saved');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update your profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={30} /></div>;
  }

  const fieldClass = 'mt-1 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100';
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">ACCOUNT SETTINGS</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Your profile</h1>
        <p className="mt-1 text-sm text-slate-500">Keep your contact and campus details up to date.</p>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-4 border-b border-slate-100 p-6">
          <span className="rounded-full bg-indigo-50 p-3 text-indigo-600"><UserRound size={24} /></span>
          <div>
            <p className="font-semibold text-slate-900">{user?.name}</p>
            <p className="text-sm capitalize text-slate-500">{user?.role} account</p>
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="text-sm font-medium text-slate-700">Full name</label>
              <input id="name" className={fieldClass} {...register('name', { required: 'Name is required' })} />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>
            <div>
              <label htmlFor="email" className="text-sm font-medium text-slate-700">Email</label>
              <input id="email" type="email" className={fieldClass} {...register('email', { required: 'Email is required', pattern: { value: /.+@.+\..+/, message: 'Enter a valid email' } })} />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>
            <div>
              <label htmlFor="studentId" className="text-sm font-medium text-slate-700">Student ID</label>
              <input id="studentId" className={fieldClass} {...register('studentId')} />
            </div>
            <div>
              <label htmlFor="department" className="text-sm font-medium text-slate-700">Department</label>
              <input id="department" className={fieldClass} {...register('department')} />
            </div>
          </div>
          <div className="border-t border-slate-100 pt-5">
            <h2 className="font-semibold text-slate-900">Change password</h2>
            <p className="mt-1 text-sm text-slate-500">Leave blank to keep your current password.</p>
            <input id="password" type="password" autoComplete="new-password" placeholder="New password" className={fieldClass} {...register('password', { minLength: { value: 8, message: 'Use at least 8 characters' } })} />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
          </div>
          <div className="flex justify-end border-t border-slate-100 pt-5">
            <button type="submit" disabled={saving || isSubmitting} className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
              {(saving || isSubmitting) && <Loader2 className="animate-spin" size={16} />}
              {saving || isSubmitting ? 'Saving…' : 'Save profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentProfile;
