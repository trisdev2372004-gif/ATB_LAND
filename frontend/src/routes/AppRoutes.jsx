import { Routes, Route } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedAdminRoute from '../components/auth/ProtectedAdminRoute';

import DashboardPage from '../pages/admin/DashboardPage';
import AccommodationsPage from '../pages/admin/AccommodationsPage';
import RentalRoomsPage from '../pages/admin/RentalRoomsPage';
import AmenitiesPage from '../pages/admin/AmenitiesPage';
import BookingsPage from '../pages/admin/BookingsPage';
import RatingsPage from '../pages/admin/RatingsPage';
//auth
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import RegisterEnterprisePage from '../pages/auth/RegisterEnterprisePage';
// import ui
import UserLayout from '../layouts/UserLayout';
import Home from '../pages/Home';
import RoomsPage from '../pages/RoomsPage';
import GuesthousesPage from '../pages/GuesthousesPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Lồng các route con vào bên trong UserLayout */}
      <Route path="/" element={<UserLayout />}>
        <Route index element={<Home />} />
        <Route path="nha-nghi" element={<GuesthousesPage />} />
        <Route path="phong-tro" element={<RoomsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register-enterprise" element={<RegisterEnterprisePage />} />
      </Route>

      

      <Route element={<ProtectedAdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="accommodations" element={<AccommodationsPage />} />
          <Route path="rental-rooms" element={<RentalRoomsPage />} />
          <Route path="amenities" element={<AmenitiesPage />} />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="ratings" element={<RatingsPage />} />
        </Route>
      </Route>

      <Route
        path="*"
        element={
          <UserLayout>
            <div className="p-8 text-center">404 - Không tìm thấy trang</div>
          </UserLayout>
        }
      />
    </Routes>
  );
}