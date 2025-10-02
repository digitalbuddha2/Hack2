import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import TeamsPage from './pages/TeamsPage';
import ProfilePage from './pages/ProfilePage';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';

// Choose your store implementation:
// For Google Sheets backend (recommended for production):
import { useGoogleSheetsStore as useStore } from './store/googleSheetsStore';
// For mock data (demo only):
// import { useStore } from './store/useStore';

function App() {
  const {
    currentUser,
    loading,
    error,
    fetchUsers,
    fetchTeams,
    setError
  } = useStore();

  // Load initial data on app start
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Promise.all([
          fetchUsers(),
          fetchTeams()
        ]);
      } catch (err) {
        console.error('Failed to load initial data:', err);
      }
    };

    loadInitialData();
  }, [fetchUsers, fetchTeams]);

  // Show loading screen during initial data fetch
  if (loading && !currentUser) {
    return <LoadingSpinner fullScreen text="Loading Airbnb Hackathon 2024..." />;
  }

  // Show error screen if initial load fails
  if (error && !currentUser) {
    return (
      <ErrorMessage
        fullScreen
        message={`Failed to connect to the backend: ${error}`}
        onRetry={() => {
          setError(null);
          fetchUsers();
          fetchTeams();
        }}
      />
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/teams" element={<TeamsPage />} />
            {currentUser && (
              <Route path="/profile" element={<ProfilePage />} />
            )}
          </Routes>
        </main>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;