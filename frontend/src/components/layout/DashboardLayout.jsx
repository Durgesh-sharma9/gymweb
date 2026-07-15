import { useState } from 'react';
import { Menu, X, Moon, Sun } from 'lucide-react';
import Sidebar from './Sidebar';
import { useTheme } from '../../context/ThemeContext';

export default function DashboardLayout({ children, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { darkMode, toggleTheme } = useTheme();

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar onNavigate={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between lg:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Menu size={20} />
            </button>
            {title && <h2 className="font-semibold text-gray-900 dark:text-white hidden sm:block">{title}</h2>}
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 max-w-7xl mx-auto animate-fade-in">{children}</div>
        </main>
      </div>

      {sidebarOpen && (
        <button
          type="button"
          className="fixed top-3 right-3 z-50 lg:hidden p-2 bg-white dark:bg-gray-900 rounded-lg shadow"
          onClick={() => setSidebarOpen(false)}
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
}
