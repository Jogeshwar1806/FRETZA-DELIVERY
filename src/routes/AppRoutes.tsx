import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { MerchantLayout } from '../layouts/MerchantLayout';

// Import Pages
import { Landing } from '../pages/Landing';
import { Home } from '../pages/Home';
import { RestaurantListing } from '../pages/RestaurantListing';
import { RestaurantDetails } from '../pages/RestaurantDetails';
import { Search } from '../pages/Search';
import { Categories } from '../pages/Categories';
import { Cart } from '../pages/Cart';
import { Offers } from '../pages/Offers';
import { Profile } from '../pages/Profile';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { NotFound } from '../pages/NotFound';
import { Checkout } from '../pages/Checkout';
import { OrderDetails } from '../pages/OrderDetails';
import { DeliveryLayout } from '../layouts/DeliveryLayout';

// Import Merchant Pages
import { MerchantDashboard } from '../pages/merchant/MerchantDashboard';
import { MerchantProfile } from '../pages/merchant/MerchantProfile';
import { MerchantMenu } from '../pages/merchant/MerchantMenu';
import { MerchantCategories } from '../pages/merchant/MerchantCategories';
import { MerchantOrders } from '../pages/merchant/MerchantOrders';
import { MerchantAnalytics } from '../pages/merchant/MerchantAnalytics';

// Import Delivery Pages
import { DeliveryDashboard } from '../pages/delivery/DeliveryDashboard';
import { ActiveDelivery } from '../pages/delivery/ActiveDelivery';
import { DeliveryHistory } from '../pages/delivery/DeliveryHistory';
import { DeliveryProfile } from '../pages/delivery/DeliveryProfile';

// Import Admin Pages
import { AdminLayout } from '../layouts/AdminLayout';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminUsers } from '../pages/admin/AdminUsers';
import { AdminMerchants } from '../pages/admin/AdminMerchants';
import { AdminOrders } from '../pages/admin/AdminOrders';
import { AdminCoupons } from '../pages/admin/AdminCoupons';
import { AdminSupport } from '../pages/admin/AdminSupport';
import { AdminSettings } from '../pages/admin/AdminSettings';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Landing page is independent */}
      <Route path="/" element={<Landing />} />

      {/* Pages inside Main Customer layout grid */}
      <Route element={<MainLayout />}>
        <Route path="/home" element={<Home />} />
        <Route path="/customer" element={<Home />} />
        <Route path="/restaurants" element={<RestaurantListing />} />
        <Route path="/restaurant/:id" element={<RestaurantDetails />} />
        <Route path="/search" element={<Search />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order/:id" element={<OrderDetails />} />
      </Route>

      {/* Merchant Dashboard Routes */}
      <Route element={<MerchantLayout />}>
        <Route path="/merchant" element={<MerchantDashboard />} />
        <Route path="/merchant/profile" element={<MerchantProfile />} />
        <Route path="/merchant/menu" element={<MerchantMenu />} />
        <Route path="/merchant/categories" element={<MerchantCategories />} />
        <Route path="/merchant/orders" element={<MerchantOrders />} />
        <Route path="/merchant/analytics" element={<MerchantAnalytics />} />
      </Route>

      {/* Delivery Partner Routes */}
      <Route element={<DeliveryLayout />}>
        <Route path="/delivery" element={<DeliveryDashboard />} />
        <Route path="/driver" element={<DeliveryDashboard />} />
        <Route path="/delivery/active" element={<ActiveDelivery />} />
        <Route path="/delivery/history" element={<DeliveryHistory />} />
        <Route path="/delivery/profile" element={<DeliveryProfile />} />
      </Route>

      {/* Admin Portal Routes */}
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/merchants" element={<AdminMerchants />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/coupons" element={<AdminCoupons />} />
        <Route path="/admin/support" element={<AdminSupport />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
      </Route>

      {/* 404 Route */}
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};
