import { useEffect, useState } from 'react';
import { Calendar, Clock, BarChart3, LayoutDashboard, LogOut, ArrowRight, Menu, X, Sun, Moon, Monitor } from 'lucide-react';
import { TimeTrackingBoard } from './components/TimeTrackingBoard';
import { DashboardView } from './components/dashboard/DashboardView';
import { ThemeToggle } from './components/ui/ThemeToggle';
import { useTheme } from './context/ThemeContext';

export default function App() {
  const [activeTab, setActiveTab] = useState<'board' | 'dashboard'>('board');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const handleLogin = () => {
    window.location.href = 'http://localhost:4000/api/auth/google';
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    window.location.reload();
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('jwt_token', token);
      window.location.href = '/';
    }
  }, []);

  const token = localStorage.getItem('jwt_token');

  if (token) {
    return (
      <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white flex flex-col w-full">
        {/* Navbar */}
        <nav className="navbar-flat flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="text-xl font-semibold text-plum flex items-center gap-2">
              <Clock className="w-6 h-6 stroke-[1.5]" /> TimeTracker
            </span>
            
            {/* Desktop Navigation Tabs */}
            <div className="hidden lg:flex items-center bg-gray-100 dark:bg-gray-900 p-1 rounded-full">
              <button
                onClick={() => setActiveTab('board')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeTab === 'board' ? 'bg-plum text-white' : 'text-gray-600 dark:text-gray-400 hover:text-plum'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 stroke-[1.5]" />
                Board
              </button>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeTab === 'dashboard' ? 'bg-plum text-white' : 'text-gray-600 dark:text-gray-400 hover:text-plum'
                }`}
              >
                <BarChart3 className="w-4 h-4 stroke-[1.5]" />
                Dashboard & Analytics
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle - Desktop */}
            <ThemeToggle />
            
            {/* Logout Button - Desktop */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            >
              <LogOut className="w-4 h-4 stroke-[1.5]" />
              Logout
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={mobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6 stroke-[1.5]" /> : <Menu className="w-6 h-6 stroke-[1.5]" />}
            </button>
          </div>
        </nav>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden animate-[fade-in_200ms_ease-out] border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
            <div className="px-4 py-4 space-y-3">
              {/* Navigation Tabs */}
              <div className="flex items-center bg-gray-100 dark:bg-gray-900 p-1 rounded-full">
                <button
                  onClick={() => {
                    setActiveTab('board');
                    setMobileMenuOpen(false);
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeTab === 'board' ? 'bg-plum text-white' : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 stroke-[1.5]" />
                  Board
                </button>
                <button
                  onClick={() => {
                    setActiveTab('dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeTab === 'dashboard' ? 'bg-plum text-white' : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 stroke-[1.5]" />
                  Analytics
                </button>
              </div>

              {/* Theme Selector */}
              <div className="space-y-1">
                <p className="px-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Giao diện</p>
                <div className="grid grid-cols-3 gap-2">
                  {['light', 'dark', 'system'].map(t => (
                    <button
                      key={t}
                      onClick={() => handleThemeChange(t as 'light' | 'dark' | 'system')}
                      className={`flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        theme === t
                          ? 'bg-plum/10 text-plum'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      {t === 'light' && <Sun className="w-5 h-5 stroke-[1.5]" />}
                      {t === 'dark' && <Moon className="w-5 h-5 stroke-[1.5]" />}
                      {t === 'system' && <Monitor className="w-5 h-5 stroke-[1.5]" />}
                      <span className="text-xs">{t === 'light' ? 'Sáng' : t === 'dark' ? 'Tối' : 'Hệ thống'}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
              >
                <LogOut className="w-4 h-4 stroke-[1.5]" />
                Đăng xuất
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'board' ? <TimeTrackingBoard /> : <DashboardView />}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white flex flex-col justify-between w-full">
      {/* Navbar */}
      <div className="navbar-flat flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-semibold text-plum flex items-center gap-2">
            <Clock className="w-6 h-6 stroke-[1.5]" /> TimeTracker Dashboard
          </span>
        </div>
        <div className="flex items-center">
          <button onClick={handleLogin} className="btn-primary">
            Sign In with Google
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="text-center max-w-xl space-y-6">
          <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-mint/20 text-plum">
            Google Calendar Integrated
          </span>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">Track your time effortlessly</h1>
          <p className="text-gray-600 dark:text-gray-400 font-normal text-base sm:text-lg">
            Connect your Google Calendar, organize events with custom groups via intuitive drag-and-drop, and analyze your productivity with detailed analytics dashboards.
          </p>
          <div className="pt-4 flex justify-center">
            <button onClick={handleLogin} className="btn-primary flex items-center gap-2 text-base px-8 py-4">
              Get Started <ArrowRight className="w-5 h-5 stroke-[1.5]" />
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="border-t border-gray-200 dark:border-gray-800 py-16 px-6 w-full bg-gray-50 dark:bg-gray-950">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="card-flat p-6 space-y-3">
            <Calendar className="w-8 h-8 text-plum stroke-[1.5]" />
            <h3 className="text-lg font-medium">Google Calendar Sync</h3>
            <p className="text-sm font-normal text-gray-600 dark:text-gray-400">Securely fetch events directly from your Google Calendar without modifying your original schedule.</p>
          </div>
          <div className="card-flat p-6 space-y-3">
            <Clock className="w-8 h-8 text-plum stroke-[1.5]" />
            <h3 className="text-lg font-medium">Smart Grouping</h3>
            <p className="text-sm font-normal text-gray-600 dark:text-gray-400">Classify events into custom color-coded groups with smooth drag and drop interface.</p>
          </div>
          <div className="card-flat p-6 space-y-3">
            <BarChart3 className="w-8 h-8 text-plum stroke-[1.5]" />
            <h3 className="text-lg font-medium">Analytics Dashboard</h3>
            <p className="text-sm font-normal text-gray-600 dark:text-gray-400">Visualize your time spent across days, weeks, and months with Pie, Bar charts, and summary tables.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 border-t border-gray-200 dark:border-gray-800 text-center text-sm font-normal text-gray-500 w-full">
        <p>© 2026 TimeTracker App - Polyrepo Architecture (NestJS + React + MongoDB)</p>
      </footer>
    </div>
  );
}
