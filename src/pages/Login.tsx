import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useToast } from '../contexts/ToastContext';

const loginSchema = z.object({
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

type LoginFields = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { showToast } = useToast();
  const [selectedRole, setSelectedRole] = React.useState<'customer' | 'restaurant_owner' | 'driver'>('customer');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: '9876543210',
      password: 'password123',
    },
  });

  React.useEffect(() => {
    if (selectedRole === 'customer') {
      setValue('phone', '9876543210');
      setValue('password', 'password123');
    } else if (selectedRole === 'restaurant_owner') {
      setValue('phone', '9999999999');
      setValue('password', 'password123');
    } else if (selectedRole === 'driver') {
      setValue('phone', '8888888888');
      setValue('password', 'password123');
    }
  }, [selectedRole, setValue]);

  const onSubmit = async (data: LoginFields) => {
    try {
      const success = await login(data.phone, data.password, selectedRole);
      if (success) {
        showToast('Welcome back to FRETZA!', 'success');
        const user = useAuthStore.getState().currentUser;
        const normalizedRole = user?.role?.toLowerCase();
        
        if (normalizedRole === 'restaurant_owner' || normalizedRole === 'restaurant owner') {
          navigate('/merchant');
        } else if (normalizedRole === 'driver' || normalizedRole === 'delivery partner') {
          navigate('/delivery');
        } else if (normalizedRole === 'admin') {
          navigate('/admin');
        } else {
          navigate('/home');
        }
      }
    } catch (err) {
      showToast(typeof err === 'string' ? err : 'Login failed. Please check your credentials.', 'error');
    }
  };

  return (
    <div className="px-gutter py-12 max-w-sm mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="font-headline-lg text-2xl text-primary font-black tracking-tighter">FRETZA</h2>
        <h3 className="font-headline-md text-base text-on-surface font-bold">Welcome Back</h3>
        <p className="text-secondary font-body-sm text-xs">Enter your details to log back into Fretza.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-2xl border border-outline-variant/10 shadow-xs space-y-4">
        {/* Role Switcher */}
        <div className="flex bg-surface-container-low p-1 rounded-xl border border-outline-variant/10">
          <button
            type="button"
            onClick={() => setSelectedRole('customer')}
            className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
              selectedRole === 'customer'
                ? 'bg-primary text-white shadow-xs'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            Customer
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole('restaurant_owner')}
            className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
              selectedRole === 'restaurant_owner'
                ? 'bg-primary text-white shadow-xs'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            Merchant
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole('driver')}
            className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
              selectedRole === 'driver'
                ? 'bg-primary text-white shadow-xs'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            Driver
          </button>
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
          <div className="flex justify-between items-center">
            <label className="block text-xs font-bold text-gray-500 uppercase">Password</label>
            <a href="#" onClick={(e) => { e.preventDefault(); showToast('Password reset option sent (Demo)', 'info'); }} className="text-[10px] text-primary font-bold hover:underline">Forgot?</a>
          </div>
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
          {isSubmitting ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      <div className="text-center text-xs text-secondary">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary font-bold hover:underline">
          Register
        </Link>
      </div>
    </div>
  );
};
