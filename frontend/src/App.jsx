import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Vendors from './pages/Vendors';
import Rfqs from './pages/Rfqs';
import Quotations from './pages/Quotations';
import VendorQuotation from './pages/VendorQuotation';
import Approvals from './pages/Approvals';
import PurchaseOrders from './pages/PurchaseOrders';
import Reports from './pages/Reports';
import ActivityLogs from './pages/ActivityLogs';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PreferencesProvider } from './context/PreferencesContext';
import { ToastProvider } from './hooks/useToasts.jsx';

const Splash = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
    <div className="flex flex-col items-center gap-3">
      <span className="material-symbols-outlined animate-spin text-primary text-[40px]">progress_activity</span>
      <span className="font-mono-data text-mono-data text-on-surface-variant uppercase tracking-widest">Restoring session…</span>
    </div>
  </div>
);

const Protected = ({ children }) => {
  const { user, hydrated } = useAuth();
  const location = useLocation();
  if (!hydrated) return <Splash />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
};

const PublicOnly = ({ children }) => {
  const { user, hydrated } = useAuth();
  if (!hydrated) return <Splash />;
  if (user) return <Navigate to={user.role ? '/dashboard' : '/dashboard'} replace />;
  return children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
    <Route path="/signup" element={<PublicOnly><Signup /></PublicOnly>} />

    <Route path="/" element={<Protected><Layout /></Protected>}>
      <Route index element={<Navigate to="/dashboard" replace />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="vendors" element={<Vendors />} />
      <Route path="rfqs" element={<Rfqs />} />
      <Route path="vendor-quotation" element={<VendorQuotation />} />
      <Route path="quotations" element={<Quotations />} />
      <Route path="approvals" element={<Approvals />} />
      <Route path="purchase-orders" element={<PurchaseOrders />} />
      <Route path="reports" element={<Reports />} />
      <Route path="activity-logs" element={<ActivityLogs />} />
    </Route>

    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

function App() {
  return (
    <AuthProvider>
      <PreferencesProvider>
        <ToastProvider>
          <Router>
            <div className="bg-surface text-on-surface font-body-md min-h-screen selection:bg-secondary-fixed selection:text-on-secondary-fixed">
              <AppRoutes />
            </div>
          </Router>
        </ToastProvider>
      </PreferencesProvider>
    </AuthProvider>
  );
}

export default App;
