export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  image: string;
  rating?: number;
  isVeg: boolean;
  category: string;
  popular?: boolean;
}

export interface RestaurantOffer {
  code: string;
  text: string;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  distance: string;
  costForTwo: number;
  image: string;
  coverImage: string;
  tags: string[];
  address: string;
  featured?: boolean;
  offers: RestaurantOffer[];
  menu: {
    bestsellers: MenuItem[];
    mains: MenuItem[];
    desserts: MenuItem[];
    beverages: MenuItem[];
  };
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  code: string;
  discount: string;
  bgImage: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  customNote?: string;
}

export interface Address {
  id: string;
  label: 'Home' | 'Work' | 'Other';
  details: string;
  isDefault?: boolean;
  houseNumber?: string;
  street?: string;
  village?: string;
  landmark?: string;
  pincode?: string;
  district?: string;
  state?: string;
  lat?: number;
  lng?: number;
}

export interface Order {
  id: string;
  restaurantId: string;
  restaurantName: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  grandTotal: number;
  date: string;
  status: 'Pending' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  deliveryAddress: string;
  paymentMethod: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role?: 'customer' | 'driver' | 'restaurant_owner' | 'admin' | 'Customer' | 'Restaurant Owner' | 'Delivery Partner' | 'Admin';
  addresses?: Address[];
  deliveryProfile?: {
    vehicleType: string;
    vehicleNumber: string;
    isVerified: boolean;
    isOnline: boolean;
    aadhaarNumber?: string;
    drivingLicenseNumber?: string;
  };
  merchantProfile?: {
    restaurantName: string;
    gstNumber?: string;
    fssaiLicense?: string;
    panNumber?: string;
    verificationStatus?: string;
  };
}
