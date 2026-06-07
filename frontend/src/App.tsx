import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import ImportPage from './pages/ImportPage';
import MatchPage from './pages/MatchPage';
import BooksPage from './pages/BooksPage';
import BookDetailPage from './pages/BookDetailPage';
import QueuePage from './pages/QueuePage';
import ConfigurationPage from './pages/ConfigurationPage';
import UserManagementPage from './pages/UserManagementPage';
import AboutPage from './pages/AboutPage';
import ImportHistoryPage from './pages/ImportHistoryPage';
import LoginPage from './pages/LoginPage';
import SetupPage from './pages/SetupPage';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';

// Layout component with sidebar (for authenticated pages)
const Layout: React.FC = () => {
  return (
    <>
      <Sidebar />
      <div className="main-content">
        <Outlet />
      </div>
    </>
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
            path: 'queue',
            element: <QueuePage />,
          },
          {
            path: 'import-history',
            element: <ImportHistoryPage />,
          },
          {
            path: 'settings/configuration',
            element: <ConfigurationPage />,
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
