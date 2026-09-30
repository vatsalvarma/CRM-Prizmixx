import React, { useState, useRef, useEffect } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays,
  parseISO
} from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GlassDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  placeholder?: string;
}

export const GlassDatePicker: React.FC<GlassDatePickerProps> = ({ value, onChange, placeholder = "Select date" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value ? parseISO(value) : new Date());
  
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const onDateClick = (day: Date) => {
    onChange(format(day, 'yyyy-MM-dd'));
    setIsOpen(false);
  };

  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center mb-3">
        <button 
          type="button"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-1 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="text-white text-sm font-medium tracking-wider">
          {format(currentMonth, 'MMMM yyyy')}
        </div>
        <button 
          type="button"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-1 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const startDate = startOfWeek(currentMonth);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center text-[10px] font-semibold text-gray-500 mb-1">
          {format(addDays(startDate, i), 'EE')}
        </div>
      );
    }
    return <div className="grid grid-cols-7 gap-1">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = '';
    const selectedDateObj = value ? parseISO(value) : null;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'd');
        const cloneDay = day;
        
        const isSelected = selectedDateObj && isSameDay(day, selectedDateObj);
        const isCurrentMonth = isSameMonth(day, monthStart);
        
        days.push(
          <button
            type="button"
            key={day.toString()}
            onClick={() => onDateClick(cloneDay)}
            className={`p-1 w-7 h-7 mx-auto flex items-center justify-center rounded-full text-[11px] transition-all
              ${!isCurrentMonth ? 'text-gray-600 hover:text-gray-400' : 'text-gray-300 hover:text-white'}
              ${isSelected ? 'bg-[var(--theme-accent)] text-white shadow-[0_0_10px_var(--theme-glow-strong)]' : 'hover:bg-white/10'}
            `}
          >
            {formattedDate}
          </button>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7 gap-1 mb-1" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div>{rows}</div>;
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Input Facade */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#090909]/80 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3 flex justify-between items-center cursor-pointer hover:border-[var(--theme-btn-border)] transition-colors"
      >
        <span className={value ? "text-white" : "text-gray-500"}>
          {value ? format(parseISO(value), 'dd MMM yyyy') : placeholder}
        </span>
        <CalendarIcon className="w-5 h-5 text-gray-500" />
      </div>

      {/* Calendar Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
            className="absolute top-full mt-2 right-0 z-50 glass-card bg-[#090909]/80 backdrop-blur-2xl rounded-[16px] p-3 border border-[var(--theme-glow-strong)] shadow-[0_20px_60px_rgba(0,0,0,0.9)] w-[240px]"
          >
            {renderHeader()}
            {renderDays()}
            {renderCells()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
