import { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

type ThemeOption = { value: 'light' | 'dark' | 'system'; label: string; icon: React.ReactNode };

const themeOptions: ThemeOption[] = [
  { value: 'light', label: 'Sáng', icon: <Sun className="w-5 h-5 stroke-[1.5]" /> },
  { value: 'dark', label: 'Tối', icon: <Moon className="w-5 h-5 stroke-[1.5]" /> },
  { value: 'system', label: 'Hệ thống', icon: <Monitor className="w-5 h-5 stroke-[1.5]" /> },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentOption = themeOptions.find(opt => opt.value === theme) || themeOptions[2];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300
                   bg-gray-100 dark:bg-gray-800
                   hover:bg-gray-200 dark:hover:bg-gray-700
                   transition-colors duration-200
                   focus:outline-none focus:ring-2 focus:ring-mint"
        aria-label="Chuyển đổi giao diện"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {currentOption.icon}
        <span className="hidden sm:inline">{currentOption.label}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700
                    shadow-lg animate-[fade-in_200ms_ease-out] z-50 scrollbar-flat"
             role="listbox"
             aria-label="Chọn chế độ giao diện">
          {themeOptions.map(option => (
            <button
              key={option.value}
              onClick={() => {
                setTheme(option.value);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-left
                         text-gray-700 dark:text-gray-300
                         hover:bg-gray-100 dark:hover:bg-gray-800
                         transition-colors duration-150
                         focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-800
                         first:rounded-t-lg last:rounded-b-lg"
              role="option"
              aria-selected={theme === option.value}
            >
              <span className="flex-shrink-0 text-plum">{option.icon}</span>
              <span className="flex-1">{option.label}</span>
              {theme === option.value && (
                <Check className="w-5 h-5 stroke-[2] text-plum flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}