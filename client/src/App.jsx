import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AdminLayout from './components/admin/AdminLayout'
import ProtectedRoute from './components/common/ProtectedRoute'
import ScrollToTop from './components/common/ScrollToTop'
import CustomerLayout from './components/layout/CustomerLayout'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { StoreProvider } from './context/StoreContext'
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminInventoryPage from './pages/admin/AdminInventoryPage'
import AdminOrdersPage from './pages/admin/AdminOrdersPage'
import AdminProductsPage from './pages/admin/AdminProductsPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import AccountPage from './pages/customer/AccountPage'
import CartPage from './pages/customer/CartPage'
import CheckoutPage from './pages/customer/CheckoutPage'
import GalleryPage from './pages/customer/GalleryPage'
import GetAppPage from './pages/customer/GetAppPage'
import HomePage from './pages/customer/HomePage'
import NotFoundPage from './pages/customer/NotFoundPage'
import OrderDetailPage from './pages/customer/OrderDetailPage'
import ProductPage from './pages/customer/ProductPage'
import ShopPage from './pages/customer/ShopPage'
import StaticPage from './pages/customer/StaticPage'
import TrackOrderPage from './pages/customer/TrackOrderPage'
import WeeklyListPage from './pages/customer/WeeklyListPage'
import WishlistPage from './pages/customer/WishlistPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <StoreProvider>
            <ScrollToTop />
            <Routes>
              <Route element={<CustomerLayout />}>
                <Route index element={<HomePage />} />
                <Route path="shop" element={<ShopPage />} />
                <Route path="gallery" element={<GalleryPage />} />
                <Route path="get-app" element={<GetAppPage />} />
                <Route path="product/:slug" element={<ProductPage />} />
                <Route path="cart" element={<CartPage />} />
                <Route path="checkout" element={<CheckoutPage />} />
                <Route path="wishlist" element={<WishlistPage />} />
                <Route path="weekly-list" element={<WeeklyListPage />} />
                <Route path="account" element={<AccountPage />} />
                <Route path="orders/:id" element={<OrderDetailPage />} />
                <Route path="track" element={<TrackOrderPage />} />
                <Route path="about" element={<StaticPage page="about" />} />
                <Route path="contact" element={<StaticPage page="contact" />} />
                <Route path="faq" element={<StaticPage page="faq" />} />
                <Route path="privacy" element={<StaticPage page="privacy" />} />
                <Route path="services" element={<StaticPage page="services" />} />
                <Route path="terms" element={<StaticPage page="terms" />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route element={<ProtectedRoute roles={['employee', 'manager', 'admin']} />}>
                <Route path="admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboardPage />} />
                  <Route path="orders" element={<AdminOrdersPage />} />
                  <Route path="products" element={<AdminProductsPage />} />
                  <Route path="categories" element={<AdminCategoriesPage />} />
                  <Route path="inventory" element={<AdminInventoryPage />} />
                </Route>
              </Route>
            </Routes>
          </StoreProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
