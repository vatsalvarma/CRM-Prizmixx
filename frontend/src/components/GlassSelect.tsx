import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface SelectOption {
  value: string | number;
  label: string;
}

interface GlassSelectProps {
  value: string | number;
  onChange: (value: any) => void;
  options: SelectOption[];
  placeholder?: string;
}

export const GlassSelect: React.FC<GlassSelectProps> = ({ value, onChange, options, placeholder = "Select an option" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative" ref={popoverRef}>
      {/* Input Facade */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#090909]/80 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3 flex justify-between items-center cursor-pointer hover:border-[var(--theme-btn-border)] transition-colors"
      >
        <span className={selectedOption ? "text-white" : "text-gray-500"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-5 h-5 text-gray-500" />
        </motion.div>
      </div>

      {/* Select Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
            className="absolute top-full mt-2 left-0 w-full z-50 glass-card !overflow-visible rounded-xl p-2 border border-[var(--theme-glow-strong)] shadow-[0_20px_40px_rgba(0,0,0,0.8)]"
          >
            <div className="max-h-60 overflow-y-auto custom-scrollbar pr-1">
              {options.map((option) => (
                <div
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 text-sm mb-1 last:mb-0
                    ${value === option.value 
                      ? 'bg-[var(--theme-glow-strong)] text-white border border-[var(--theme-btn-border)] shadow-[0_0_10px_var(--theme-glow-weak)]' 
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >
                  {option.label}
                </div>
              ))}
              {options.length === 0 && (
                <div className="px-4 py-3 text-gray-500 text-sm text-center">No options available</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
