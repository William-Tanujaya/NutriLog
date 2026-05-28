import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import ProtectedRoute from './components/ProtectedRoute';
import AuthPage from './pages/AuthPage';
import OnboardingPage from './pages/OnboardingPage';
import LandingPage from './pages/LandingPage';
import RecipesPage from './pages/RecipesPage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import CartPage from './pages/CartPage';
import SummaryPage from './pages/SummaryPage';
import WishlistPage from './pages/WishlistPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/auth" element={<AuthPage />} />

            {/* Auth required, no profile needed */}
            <Route path="/onboarding" element={
              <ProtectedRoute requireProfile={false}><OnboardingPage /></ProtectedRoute>
            } />

            {/* Auth + profile required */}
            <Route path="/"         element={<ProtectedRoute><LandingPage /></ProtectedRoute>} />
            <Route path="/recipes"  element={<ProtectedRoute><RecipesPage /></ProtectedRoute>} />
            <Route path="/recipe/:id" element={<ProtectedRoute><RecipeDetailPage /></ProtectedRoute>} />
            <Route path="/cart"     element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
            <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
            <Route path="/summary"  element={<ProtectedRoute><SummaryPage /></ProtectedRoute>} />
            <Route path="/profile"  element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/auth" replace />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}
