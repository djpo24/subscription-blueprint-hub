
import * as React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { cn } from "@/lib/utils";

interface CalendarProps {
  mode?: 'single';
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
  className?: string;
  initialFocus?: boolean;
}

function Calendar({
  className,
  selected,
  onSelect,
  disabled,
  initialFocus,
}: CalendarProps) {
  const handleDateChange = (date: Date | null) => {
    if (onSelect) {
      onSelect(date || undefined);
    }
  };

  const isDateDisabled = (date: Date) => {
    if (disabled) {
      return disabled(date);
    }
    return false;
  };

  return (
    <div className={cn("p-3", className)}>
      <style>{`
        .react-datepicker {
          border: none !important;
          box-shadow: none !important;
          font-family: inherit !important;
        }
        .react-datepicker__header {
          background-color: transparent !important;
          border-bottom: 1px solid #e5e7eb !important;
          padding: 0.75rem !important;
        }
        .react-datepicker__current-month {
          font-size: 0.875rem !important;
          font-weight: 500 !important;
          color: #111827 !important;
        }
        .react-datepicker__day-names {
          margin-bottom: 0.5rem !important;
        }
        .react-datepicker__day-name {
          color: #6b7280 !important;
          font-size: 0.8rem !important;
          font-weight: normal !important;
          width: 2.25rem !important;
          height: 2.25rem !important;
          line-height: 2.25rem !important;
        }
        .react-datepicker__month {
          margin: 0.25rem !important;
        }
        .react-datepicker__week {
          display: flex !important;
        }
        .react-datepicker__day {
          width: 2.25rem !important;
          height: 2.25rem !important;
          line-height: 2.25rem !important;
          text-align: center !important;
          font-size: 0.875rem !important;
          font-weight: normal !important;
          color: #111827 !important;
          border-radius: 0.375rem !important;
          margin: 0.125rem !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
        }
        .react-datepicker__day:hover {
          background-color: #f3f4f6 !important;
          color: #111827 !important;
        }
        .react-datepicker__day--selected {
          background-color: #111827 !important;
          color: #ffffff !important;
        }
        .react-datepicker__day--selected:hover {
          background-color: #111827 !important;
          color: #ffffff !important;
        }
        .react-datepicker__day--today {
          background-color: #f3f4f6 !important;
          color: #111827 !important;
          font-weight: 500 !important;
        }
        .react-datepicker__day--outside-month {
          color: #9ca3af !important;
          opacity: 0.5 !important;
        }
        .react-datepicker__day--disabled {
          color: #9ca3af !important;
          opacity: 0.5 !important;
          cursor: not-allowed !important;
        }
        .react-datepicker__day--disabled:hover {
          background-color: transparent !important;
        }
        .react-datepicker__navigation {
          top: 0.75rem !important;
          width: 1.75rem !important;
          height: 1.75rem !important;
          background: transparent !important;
          border: 1px solid #d1d5db !important;
          border-radius: 0.375rem !important;
          opacity: 0.5 !important;
          transition: opacity 0.2s ease !important;
        }
        .react-datepicker__navigation:hover {
          opacity: 1 !important;
        }
        .react-datepicker__navigation--previous {
          left: 0.25rem !important;
        }
        .react-datepicker__navigation--next {
          right: 0.25rem !important;
        }
        .react-datepicker__navigation-icon::before {
          border-color: #6b7280 !important;
          border-width: 2px 2px 0 0 !important;
          width: 6px !important;
          height: 6px !important;
          top: 9px !important;
        }
      `}</style>
      <DatePicker
        selected={selected}
        onChange={handleDateChange}
        inline
        filterDate={(date) => !isDateDisabled(date)}
        autoFocus={initialFocus}
      />
    </div>
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
