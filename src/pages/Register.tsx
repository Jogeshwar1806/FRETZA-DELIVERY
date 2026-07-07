import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useToast } from '../contexts/ToastContext';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

type RegisterFields = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerMockUser } = useAuthStore();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFields>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFields) => {
    try {
      await registerMockUser(data.name, data.email, data.phone, data.password);
      showToast(`Welcome to FRETZA, ${data.name}!`, 'success');
      navigate('/home');
    } catch (err) {
      showToast(typeof err === 'string' ? err : 'Registration failed.', 'error');
    }
  };

  return (
    <div className="px-gutter py-12 max-w-sm mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="font-headline-lg text-2xl text-primary font-black tracking-tighter">FRETZA</h2>
        <h3 className="font-headline-md text-base text-on-surface font-bold">Create Account</h3>
        <p className="text-secondary font-body-sm text-xs">Join FRETZA and get hot local food delivered fast.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-2xl border border-outline-variant/10 shadow-xs space-y-4">
        {/* Name Field */}
        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-bold text-gray-500 uppercase">Full Name</label>
          <input
            type="text"
            placeholder="e.g. Jogesh Dwivedi"
            {...register('name')}
            className={`w-full bg-surface-container-low border rounded-xl px-3 py-2 text-xs focus:ring-1 focus:outline-none focus:bg-white ${
              errors.name ? 'border-red-500 focus:ring-red-500' : 'border-outline-variant/30 focus:ring-primary'
            }`}
          />
          {errors.name && (
            <p className="text-[10px] text-red-500 font-semibold">{errors.name.message}</p>
          )}
        </div>

        {/* Email Field */}
        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-bold text-gray-500 uppercase">Email Address</label>
          <input
            type="email"
            placeholder="e.g. jogesh@gmail.com"
            {...register('email')}
            className={`w-full bg-surface-container-low border rounded-xl px-3 py-2 text-xs focus:ring-1 focus:outline-none focus:bg-white ${
              errors.email ? 'border-red-500 focus:ring-red-500' : 'border-outline-variant/30 focus:ring-primary'
            }`}
          />
          {errors.email && (
            <p className="text-[10px] text-red-500 font-semibold">{errors.email.message}</p>
          )}
        </div>

        {/* Phone Field */}
        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-bold text-gray-500 uppercase">Phone Number</label>
          <input
            type="text"
            placeholder="e.g. 9876543210"
            {...register('phone')}
            className={`w-full bg-surface-container-low border rounded-xl px-3 py-2 text-xs focus:ring-1 focus:outline-none focus:bg-white ${
              errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-outline-variant/30 focus:ring-primary'
            }`}
          />
          {errors.phone && (
            <p className="text-[10px] text-red-500 font-semibold">{errors.phone.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-bold text-gray-500 uppercase">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            {...register('password')}
            className={`w-full bg-surface-container-low border rounded-xl px-3 py-2 text-xs focus:ring-1 focus:outline-none focus:bg-white ${
              errors.password ? 'border-red-500 focus:ring-red-500' : 'border-outline-variant/30 focus:ring-primary'
            }`}
          />
          {errors.password && (
            <p className="text-[10px] text-red-500 font-semibold">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-primary text-white font-bold rounded-xl text-xs hover:bg-orange-600 transition-colors shadow-md disabled:bg-orange-300 mt-2 flex items-center justify-center gap-1.5"
        >
          {isSubmitting ? 'Registering...' : 'Register'}
        </button>
      </form>

      <div className="text-center text-xs text-secondary">
        Already have an account?{' '}
        <Link to="/login" className="text-primary font-bold hover:underline">
          Log In
        </Link>
      </div>
    </div>
  );
};
