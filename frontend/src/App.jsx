import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Vendors from './pages/Vendors';
import Rfqs from './pages/Rfqs';
import Quotations from './pages/Quotations';
import Approvals from './pages/Approvals';
import PurchaseOrders from './pages/PurchaseOrders';
import Reports from './pages/Reports';
import ActivityLogs from './pages/ActivityLogs';

function App() {
  return (
    <Router>
      <div className="bg-surface text-on-surface font-body-md min-h-screen selection:bg-secondary-fixed selection:text-on-secondary-fixed">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="vendors" element={<Vendors />} />
            <Route path="rfqs" element={<Rfqs />} />
            <Route path="quotations" element={<Quotations />} />
            <Route path="approvals" element={<Approvals />} />
            <Route path="purchase-orders" element={<PurchaseOrders />} />
            <Route path="reports" element={<Reports />} />
            <Route path="activity-logs" element={<ActivityLogs />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
