import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/login/Login';
import { Signup } from './pages/signup/Signup';
import Home from './pages/home/Home';
import { useAuthStore } from './store/useAuthStore';
import { useThemeStore } from './store/useThemeStore';
import { Toaster } from 'react-hot-toast';
import { FiSun, FiMoon } from 'react-icons/fi';

function App() {
  const { authUser, connectSocket, disconnectSocket } = useAuthStore();
  const { theme, toggleTheme, initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  useEffect(() => {
    if (authUser) {
      connectSocket();
    } else {
      disconnectSocket();
    }
  }, [authUser, connectSocket, disconnectSocket]);

  return (
    <div className="relative flex items-center justify-center w-full min-h-screen p-4 transition-colors duration-300">
      <Toaster position="top-right" reverseOrder={false} />
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 p-2.5 rounded-full shadow-lg border backdrop-blur-md transition-all duration-300 hover:scale-110 cursor-pointer bg-white/80 border-slate-200 text-amber-500 hover:bg-slate-100 dark:bg-slate-800/85 dark:border-slate-700/60 dark:text-blue-400 dark:hover:bg-slate-700/80"
        aria-label="Toggle Theme"
      >
        {theme === 'light' ? (
          <FiSun className="w-5 h-5" />
        ) : (
          <FiMoon className="w-5 h-5" />
        )}
      </button>

      <Routes>
        <Route
          path="/"
          element={authUser ? <Home /> : <Navigate to="/login" />}
        />
        <Route
          path="/login"
          element={authUser ? <Navigate to="/" /> : <Login />}
        />
        <Route
          path="/signup"
          element={authUser ? <Navigate to="/" /> : <Signup />}
        />
      </Routes>
    </div>
  );
}

export default App;
