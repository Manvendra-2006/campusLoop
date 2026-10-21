import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileUp, Loader2, ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const categories = ['Facilities & maintenance', 'Cleanliness', 'Safety & security', 'IT & connectivity', 'Academic services', 'Other'];

const SubmitComplaint = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const [fileName, setFileName] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    const image = data.image?.[0];
    if (image && !['image/jpeg', 'image/png', 'image/webp'].includes(image.type)) {
      toast.error('Choose a JPEG, PNG, or WebP image');
      return;
    }
    if (image && image.size > 5 * 1024 * 1024) {
      toast.error('Image must be 5 MB or smaller');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', data.title.trim());
      formData.append('description', data.description.trim());
      formData.append('category', data.category);
      formData.append('location[building]', data.building.trim());
      if (data.room?.trim()) formData.append('location[room]', data.room.trim());
      if (image) formData.append('image', image);
      if (data.suggestedDepartment?.trim()) formData.append('suggestedDepartment', data.suggestedDepartment.trim());

      const response = await api.post('/complaints', formData);
      toast.success('Your complaint was submitted');
      navigate(`/student/complaints/${response.data.complaint._id}`);
    } catch (error) {
      const validationMessage = error.response?.data?.errors?.[0]?.msg;
      toast.error(error.response?.data?.message || validationMessage || 'Unable to submit your complaint');
    }
  };

  const fieldClass = 'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100';

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/student/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-700">
        <ArrowLeft size={16} /> Back to overview
      </Link>
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-6 sm:px-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">STUDENT SUPPORT</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Submit a complaint</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">Share enough detail for the campus team to understand and address the issue.</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 px-6 py-6 sm:px-8">
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-slate-700">Short title <span className="text-red-500">*</span></label>
            <input id="title" maxLength={120} placeholder="For example: Lights not working in the library" className={fieldClass} {...register('title', { required: 'A short title is required', maxLength: { value: 120, message: 'Keep the title under 120 characters' } })} />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="category" className="block text-sm font-semibold text-slate-700">Category <span className="text-red-500">*</span></label>
              <select id="category" className={fieldClass} defaultValue="" {...register('category', { required: 'Choose a category' })}>
                <option value="" disabled>Select a category</option>
                {categories.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
              {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
            </div>
            <div>
              <label htmlFor="suggestedDepartment" className="block text-sm font-semibold text-slate-700">Department (optional)</label>
              <input id="suggestedDepartment" placeholder="e.g. Facilities" className={fieldClass} {...register('suggestedDepartment')} />
            </div>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-slate-700">What happened? <span className="text-red-500">*</span></label>
            <textarea id="description" rows={6} maxLength={5000} placeholder="Describe the issue, when it started, and any details that may help." className={`${fieldClass} resize-y`} {...register('description', { required: 'Please describe the issue', minLength: { value: 10, message: 'Please add a little more detail (at least 10 characters)' }, maxLength: { value: 5000, message: 'Description must be under 5,000 characters' } })} />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="building" className="block text-sm font-semibold text-slate-700">Building or area <span className="text-red-500">*</span></label>
              <input id="building" placeholder="e.g. Main Library" className={fieldClass} {...register('building', { required: 'Building or area is required' })} />
              {errors.building && <p className="mt-1 text-sm text-red-600">{errors.building.message}</p>}
            </div>
            <div>
              <label htmlFor="room" className="block text-sm font-semibold text-slate-700">Room (optional)</label>
              <input id="room" placeholder="e.g. Room 204" className={fieldClass} {...register('room')} />
            </div>
          </div>
          <div>
            <label htmlFor="image" className="block text-sm font-semibold text-slate-700">Photo evidence (optional)</label>
            <label htmlFor="image" className="mt-1 flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-slate-300 px-4 py-4 transition hover:border-indigo-400 hover:bg-indigo-50/50">
              <span className="rounded-lg bg-indigo-50 p-2 text-indigo-600"><FileUp size={20} /></span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-slate-800">{fileName || 'Choose an image'}</span>
                <span className="mt-1 block text-xs text-slate-500">JPEG, PNG or WebP · up to 5 MB</span>
              </span>
              <input id="image" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" {...register('image', { onChange: (event) => setFileName(event.target.files?.[0]?.name || '') })} />
            </label>
          </div>
          <div className="flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-500">
            <ShieldCheck size={17} className="mt-0.5 shrink-0 text-emerald-600" />
            Your complaint is visible to you and authorized campus administrators.
          </div>
          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <Link to="/student/complaints" className="rounded-lg border border-slate-300 px-4 py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</Link>
            <button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">
              {isSubmitting && <Loader2 className="animate-spin" size={16} />}
              {isSubmitting ? 'Submitting…' : 'Submit complaint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitComplaint;
