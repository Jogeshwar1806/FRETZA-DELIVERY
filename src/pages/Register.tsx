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
  // Driver Fields
  vehicleType: z.string().optional(),
  vehicleNumber: z.string().optional(),
  drivingLicenseNumber: z.string().optional(),
  aadhaarNumber: z.string().optional(),
  // Merchant Fields
  restaurantName: z.string().optional(),
  panNumber: z.string().optional(),
  fssaiLicense: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankName: z.string().optional(),
  bankIfsc: z.string().optional(),
});

type RegisterFields = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerMockUser } = useAuthStore();
  const { showToast } = useToast();
  const [selectedRole, setSelectedRole] = React.useState<'customer' | 'driver' | 'restaurant_owner'>('customer');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFields>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFields) => {
    try {
      let extraFields: any = {};
      if (selectedRole === 'driver') {
        extraFields = {
          vehicleType: data.vehicleType,
          vehicleNumber: data.vehicleNumber,
          drivingLicenseNumber: data.drivingLicenseNumber,
          aadhaarNumber: data.aadhaarNumber,
        };
      } else if (selectedRole === 'restaurant_owner') {
        extraFields = {
          restaurantName: data.restaurantName,
          panNumber: data.panNumber,
          fssaiLicense: data.fssaiLicense,
          bankDetails: {
            accountNumber: data.bankAccountNumber,
            bankName: data.bankName,
            ifscCode: data.bankIfsc,
            accountHolderName: data.name,
          },
        };
      }

      await registerMockUser(data.name, data.email, data.phone, data.password, selectedRole, extraFields);
      showToast(`Welcome to FRETZA, ${data.name}!`, 'success');
      
      if (selectedRole === 'restaurant_owner') {
        navigate('/merchant');
      } else if (selectedRole === 'driver') {
        navigate('/delivery');
      } else {
        navigate('/home');
      }
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

        {/* Driver Dynamic Fields */}
        {selectedRole === 'driver' && (
          <>
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-bold text-gray-500 uppercase">Vehicle Type</label>
              <select
                {...register('vehicleType')}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:outline-none focus:bg-white"
              >
                <option value="Bike">Bike</option>
                <option value="Scooter">Scooter</option>
                <option value="Bicycle">Bicycle</option>
                <option value="Car">Car</option>
              </select>
            </div>
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-bold text-gray-500 uppercase">Vehicle Number</label>
              <input
                type="text"
                placeholder="e.g. OD-11-A-1234"
                {...register('vehicleNumber')}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:outline-none focus:bg-white"
              />
            </div>
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-bold text-gray-500 uppercase">Driving License Number</label>
              <input
                type="text"
                placeholder="e.g. DL-12345678"
                {...register('drivingLicenseNumber')}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:outline-none focus:bg-white"
              />
            </div>
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-bold text-gray-500 uppercase">Aadhaar Number</label>
              <input
                type="text"
                placeholder="e.g. 1234 5678 9012"
                {...register('aadhaarNumber')}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:outline-none focus:bg-white"
              />
            </div>
          </>
        )}

        {/* Merchant Dynamic Fields */}
        {selectedRole === 'restaurant_owner' && (
          <>
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-bold text-gray-500 uppercase">Restaurant Name</label>
              <input
                type="text"
                placeholder="e.g. Royal Biryani Kitchen"
                {...register('restaurantName')}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:outline-none focus:bg-white"
              />
            </div>
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-bold text-gray-500 uppercase">PAN Number</label>
              <input
                type="text"
                placeholder="e.g. ABCDE1234F"
                {...register('panNumber')}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:outline-none focus:bg-white"
              />
            </div>
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-bold text-gray-500 uppercase">FSSAI License Number</label>
              <input
                type="text"
                placeholder="e.g. 12345678901234"
                {...register('fssaiLicense')}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:outline-none focus:bg-white"
              />
            </div>
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-bold text-gray-500 uppercase">Bank Account Number</label>
              <input
                type="text"
                placeholder="e.g. 1234567890"
                {...register('bankAccountNumber')}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:outline-none focus:bg-white"
              />
            </div>
            <div className="space-y-1.5 text-left">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Bank Name</label>
                  <input
                    type="text"
                    placeholder="SBI, HDFC..."
                    {...register('bankName')}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-2 py-1.5 text-xs focus:ring-1 focus:outline-none focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">IFSC Code</label>
                  <input
                    type="text"
                    placeholder="SBIN0001234"
                    {...register('bankIfsc')}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-2 py-1.5 text-xs focus:ring-1 focus:outline-none focus:bg-white"
                  />
                </div>
              </div>
            </div>
          </>
        )}

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
