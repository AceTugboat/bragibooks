import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import ImportPage from './pages/ImportPage';
import MatchPage from './pages/MatchPage';
import BooksPage from './pages/BooksPage';
import BookDetailPage from './pages/BookDetailPage';
import ProcessingPage from './pages/ProcessingPage';
import ConfigurationPage from './pages/ConfigurationPage';
import UserManagementPage from './pages/UserManagementPage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import SetupPage from './pages/SetupPage';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { useData } from './context/DataContext';
import ToastContainer from './components/ToastContainer';

// Layout component with sidebar (for authenticated pages)
const Layout: React.FC = () => {
  const { toasts, dismissToast } = useData();
  return (
    <ErrorBoundary>
      <Sidebar />
      <div className="main-content">
        <Outlet />
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ErrorBoundary>
  );
};

// Create router configuration
const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/setup',
    element: <SetupPage />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          {
            index: true,
            element: <BooksPage />, // Books is the home page
          },
          {
            path: 'books/:id',
            element: <BookDetailPage />,
          },
          {
            path: 'import',
            element: <ImportPage />,
          },
          {
            path: 'match',
            element: <MatchPage />,
          },
          {
            path: 'processing',
            element: <ProcessingPage />,
          },
          {
            path: 'queue',
            element: <Navigate to="/processing" replace />,
          },
          {
            path: 'import-history',
            element: <Navigate to="/processing" replace />,
          },
          {
            path: 'settings/configuration',
            element: <ConfigurationPage />,
          },
          {
            path: 'settings/security',
            element: <ProcessingPage />, // placeholder until T-11 wires it
          },
          {
            path: 'settings/users',
            element: <UserManagementPage />,
          },
          {
            path: 'settings/about',
            element: <AboutPage />,
          },
        ],
      },
    ],
  },
]);

// Main App component
const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
