import React, { useState, useMemo, useEffect } from 'react';

interface DateRangePickerProps {
    label?: string;
    placeholder?: string;
    className?: string;
    required?: boolean;
    disabled?: boolean;
    error?: string;
    value?: string;
    onChange?: (value: string) => void;
    // New props for customizing year range
    startYear?: number;
    endYear?: number;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ 
    label, 
    placeholder = 'Select Dates', 
    className = "", 
    required, 
    disabled = false,
    error,
    value,
    onChange,
    // Default year range: 10 years back, 10 years forward
    startYear,
    endYear
}) => {
    const [showDateRangePicker, setShowDateRangePicker] = useState(false);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>('');
    
    // Separate year state for each calendar
    const [currentYear1, setCurrentYear1] = useState<number>(new Date().getFullYear());
    const [currentYear2, setCurrentYear2] = useState<number>(new Date().getFullYear());
    const [currentMonth1, setCurrentMonth1] = useState<number>(new Date().getMonth());
    const [currentMonth2, setCurrentMonth2] = useState<number>((new Date().getMonth() + 1) % 12);
    
    // View states for both calendars separately
    const [calendar1View, setCalendar1View] = useState<'calendar' | 'years' | 'months'>('calendar');
    const [calendar2View, setCalendar2View] = useState<'calendar' | 'years' | 'months'>('calendar');

    const today = new Date();
    
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // Define formatDateDisplay before it's used
    const formatDateDisplay = (date: Date) => {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString(undefined, options);
    };

    useEffect(() => {
        if (value) {
            setSelectedDate(value);
        }
    }, [value]);

    useEffect(() => {
        if (onChange && selectedDate) {
            onChange(selectedDate);
        }
    }, [selectedDate, onChange]);

    // Create year ranges for both calendars
    const getYearsRange = (currentYear: number) => {
        // Use props for year range if provided, otherwise use defaults
        const rangeStart = startYear ?? currentYear - 10;
        const rangeEnd = endYear ?? currentYear + 10;
        const years = [];
        for (let year = rangeStart; year <= rangeEnd; year++) {
            years.push(year);
        }
        return years;
    };

    const yearsRange1 = useMemo(() => getYearsRange(currentYear1), [currentYear1, startYear, endYear]);
    const yearsRange2 = useMemo(() => getYearsRange(currentYear2), [currentYear2, startYear, endYear]);

    const getMonthDays = (month: number, year: number) => {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        return Array.from({ length: daysInMonth }, (_, i) => i + 1);
    };

    const getPaddedDays = (month: number, year: number) => {
        const startDay = new Date(year, month, 1).getDay();
        return Array(startDay).fill(null).concat(getMonthDays(month, year));
    };

    const paddedDays1 = useMemo(() => getPaddedDays(currentMonth1, currentYear1), [currentMonth1, currentYear1]);
    const paddedDays2 = useMemo(() => getPaddedDays(currentMonth2, currentYear2), [currentMonth2, currentYear2]);

    const startDateFormatted = useMemo(() => 
        startDate ? formatDateDisplay(startDate) : '', 
    [startDate]);
    
    const endDateFormatted = useMemo(() => 
        endDate ? formatDateDisplay(endDate) : '', 
    [endDate]);

    const prevMonth = (monthSetter: React.Dispatch<React.SetStateAction<number>>, yearSetter: React.Dispatch<React.SetStateAction<number>>) => {
        monthSetter(prev => {
            if (prev === 0) {
                yearSetter(y => y - 1);
                return 11;
            }
            return prev - 1;
        });
    };

    const nextMonth = (monthSetter: React.Dispatch<React.SetStateAction<number>>, yearSetter: React.Dispatch<React.SetStateAction<number>>) => {
        monthSetter(prev => {
            if (prev === 11) {
                yearSetter(y => y + 1);
                return 0;
            }
            return prev + 1;
        });
    };

    const selectDate = (day: number | null, calendarIndex: 1 | 2) => {
        if (!day) return;
        
        const currentYear = calendarIndex === 1 ? currentYear1 : currentYear2;
        const currentMonth = calendarIndex === 1 ? currentMonth1 : currentMonth2;
        
        if (!startDate) {
            setStartDate(new Date(currentYear, currentMonth, day));
        } else if (!endDate) {
            const newEndDate = new Date(currentYear, currentMonth, day);
            
            if (newEndDate < startDate) {
                setEndDate(startDate);
                setStartDate(newEndDate);
            } else {
                setEndDate(newEndDate);
            }
        } else {
            setStartDate(new Date(currentYear, currentMonth, day));
            setEndDate(null);
        }
    };

    const isDateInRange = (day: number | null, month: number, year: number) => {
        if (!day) return false;
        
        if (startDate && endDate) {
            const start = startDate;
            const end = endDate;
            const current = new Date(year, month, day);
            return current >= start && current <= end;
        }
        return false;
    };

    const isStartDate = (day: number | null, month: number, year: number) => {
        if (!day || !startDate) return false;
        
        const current = new Date(year, month, day);
        return current.getDate() === startDate.getDate() && 
               current.getMonth() === startDate.getMonth() && 
               current.getFullYear() === startDate.getFullYear();
    };

    const isEndDate = (day: number | null, month: number, year: number) => {
        if (!day || !endDate) return false;
        
        const current = new Date(year, month, day);
        return current.getDate() === endDate.getDate() && 
               current.getMonth() === endDate.getMonth() && 
               current.getFullYear() === endDate.getFullYear();
    };

    const setDateRange = () => {
        if (startDate && endDate) {
            const startFormatted = formatDateDisplay(startDate);
            const endFormatted = formatDateDisplay(endDate);
            const newSelectedDate = `${startFormatted} - ${endFormatted}`;
            setSelectedDate(newSelectedDate);
            setShowDateRangePicker(false);
        }
    };

    // Toggle the view for calendar 1
    const toggleCalendar1View = (view: 'years' | 'months') => {
        setCalendar1View(calendar1View === view ? 'calendar' : view);
    };

    // Toggle the view for calendar 2
    const toggleCalendar2View = (view: 'years' | 'months') => {
        setCalendar2View(calendar2View === view ? 'calendar' : view);
    };

    const selectYear1 = (year: number) => {
        setCurrentYear1(year);
        setCalendar1View('calendar');
    };

    const selectYear2 = (year: number) => {
        setCurrentYear2(year);
        setCalendar2View('calendar');
    };

    const selectMonth1 = (index: number) => {
        setCurrentMonth1(index);
        setCalendar1View('calendar');
    };

    const selectMonth2 = (index: number) => {
        setCurrentMonth2(index);
        setCalendar2View('calendar');
    };

    // Function to synchronize the second calendar with the first
    const syncSecondCalendar = () => {
        // If month2 is behind month1 or same year/month, adjust it
        if (currentYear2 < currentYear1 || 
            (currentYear2 === currentYear1 && currentMonth2 <= currentMonth1)) {
            if (currentMonth1 === 11) {
                setCurrentMonth2(0);
                setCurrentYear2(currentYear1 + 1);
            } else {
                setCurrentMonth2(currentMonth1 + 1);
                setCurrentYear2(currentYear1);
            }
        }
    };

    // Synchronize calendars when first calendar changes
    useEffect(() => {
        syncSecondCalendar();
    }, [currentYear1, currentMonth1]);

    const renderCalendar1 = () => {
        if (calendar1View === 'years') {
            return (
                <div className="absolute top-16 left-0 right-0 bg-white shadow-lg rounded-xl z-50 p-4">
                    <ul className="flex flex-col text-xs h-64 overflow-y-auto">
                        {yearsRange1.map((year, index) => (
                            <li key={index}>
                                <button 
                                    onClick={() => selectYear1(year)}
                                    className={`px-6 py-1.5 w-full leading-5 hover:bg-gray-50 hover:text-blue-600 text-left cursor-pointer ${currentYear1 === year ? 'font-semibold' : ''}`}
                                >
                                    {year}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            );
        }

        if (calendar1View === 'months') {
            return (
                <div className="absolute top-16 left-0 right-0 bg-white shadow-lg rounded-xl z-50 p-4">
                    <ul className="flex flex-col text-xs h-64 overflow-y-auto">
                        {months.map((month, index) => (
                            <li key={index}>
                                <button 
                                    onClick={() => selectMonth1(index)}
                                    className={`px-6 py-1.5 w-full leading-5 hover:bg-gray-50 hover:text-blue-600 text-left cursor-pointer ${currentMonth1 === index ? 'font-semibold' : ''}`}
                                >
                                    {month}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            );
        }

        return null;
    };

    const renderCalendar2 = () => {
        if (calendar2View === 'years') {
            return (
                <div className="absolute top-16 left-0 right-0 bg-white shadow-lg rounded-xl z-50 p-4">
                    <ul className="flex flex-col text-xs h-64 overflow-y-auto">
                        {yearsRange2.map((year, index) => (
                            <li key={index}>
                                <button 
                                    onClick={() => selectYear2(year)}
                                    className={`px-6 py-1.5 w-full leading-5 hover:bg-gray-50 hover:text-blue-600 text-left cursor-pointer ${currentYear2 === year ? 'font-semibold' : ''}`}
                                >
                                    {year}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            );
        }

        if (calendar2View === 'months') {
            return (
                <div className="absolute top-16 left-0 right-0 bg-white shadow-lg rounded-xl z-50 p-4">
                    <ul className="flex flex-col text-xs h-64 overflow-y-auto">
                        {months.map((month, index) => (
                            <li key={index}>
                                <button 
                                    onClick={() => selectMonth2(index)}
                                    className={`px-6 py-1.5 w-full leading-5 hover:bg-gray-50 hover:text-blue-600 text-left cursor-pointer ${currentMonth2 === index ? 'font-semibold' : ''}`}
                                >
                                    {month}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1">
                {label && <label className="text-[10px] md:text-xs text-gray-700">{label}</label>}
                {required && <span className="text-[10px] md:text-xs text-red-400">*</span>}
            </div>
            <div className="relative">
                <div 
                    onClick={() => !disabled && setShowDateRangePicker(true)}
                    className={`py-2 px-4 text-[10px] md:text-xs border border-gray-300 rounded-md cursor-pointer ${
                        disabled ? 'bg-gray-50' : 'bg-white'
                    } ${className}`}
                >
                    {selectedDate || placeholder}
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none z-10">
                    <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path
                            d="M5.25 12a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H6a.75.75 0 01-.75-.75V12zM6 13.25a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75V14a.75.75 0 00-.75-.75H6zM7.25 12a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H8a.75.75 0 01-.75-.75V12zM8 13.25a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75V14a.75.75 0 00-.75-.75H8zM9.25 10a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H10a.75.75 0 01-.75-.75V10zM10 11.25a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75V12a.75.75 0 00-.75-.75H10zM9.25 14a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H10a.75.75 0 01-.75-.75V14zM12 9.25a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75V10a.75.75 0 00-.75-.75H12zM11.25 12a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H12a.75.75 0 01-.75-.75V12zM12 13.25a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75V14a.75.75 0 00-.75-.75H12zM13.25 10a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H14a.75.75 0 01-.75-.75V10zM14 11.25a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75V12a.75.75 0 00-.75-.75H14z">
                        </path>
                        <path clipRule="evenodd" fillRule="evenodd"
                            d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z">
                        </path>
                    </svg>
                </div>
            </div>
            {error && <div className="text-red-600 text-[10px] font-medium">{error}</div>}

            {showDateRangePicker && (
                <div className="fixed inset-0 z-50 flex items-center justify-center w-full">
                    <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowDateRangePicker(false)}></div>
                    <div className="flex bg-white shadow-lg rounded-xl z-50 justify-center max-h-screen overflow-y-scroll sm:overflow-y-scroll xs:overflow-y-scroll md:overflow-hidden lg:overflow-hidden xl:overflow-hidden">
                        <div className="flex flex-col my-5">
                            <div className="flex flex-col md:flex-row">
                                {/* First Calendar */}
                                <div className="flex flex-col px-6 pt-5 pb-6 border-b border-gray-100 mb-4 md:mb-0 md:border-r md:border-b-0 relative">
                                    <div className="flex items-center justify-between">
                                        {/* Previous month navigation button */}
                                        <button onClick={() => prevMonth(setCurrentMonth1, setCurrentYear1)} className="flex items-center justify-center p-2 rounded-xl hover:bg-gray-50 cursor-pointer">
                                            <svg className="w-6 h-6 text-gray-900 stroke-current" fill="none">
                                                <path d="M13.25 8.75L9.75 12l3.5 3.25" strokeWidth="1.5" strokeLinecap="round"
                                                    strokeLinejoin="round" />
                                            </svg>
                                        </button>
                                        {/* Calendar 1 header with year and month */}
                                        <div className="flex items-center">
                                            <button
                                                onClick={() => toggleCalendar1View('years')}
                                                className="px-2 py-1 text-sm font-semibold hover:bg-gray-50 hover:text-blue-600 cursor-pointer"
                                            >
                                                {currentYear1}
                                            </button>
                                            <button
                                                onClick={() => toggleCalendar1View('months')}
                                                className="px-2 py-1 text-sm font-semibold hover:bg-gray-50 hover:text-blue-600 cursor-pointer"
                                            >
                                                {months[currentMonth1]}
                                            </button>
                                        </div>
                                        {/* Next month navigation button */}
                                        <button onClick={() => nextMonth(setCurrentMonth1, setCurrentYear1)} className="flex items-center justify-center p-2 rounded-xl hover:bg-gray-50 cursor-pointer">
                                            <svg className="w-6 h-6 text-gray-900 stroke-current" fill="none">
                                                <path d="M10.75 8.75l3.5 3.25-3.5 3.25" strokeWidth="1.5" strokeLinecap="round"
                                                    strokeLinejoin="round" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Days of the week header */}
                                    <div className="grid grid-cols-7 text-xs text-center text-gray-900 mt-4">
                                        <span className="font-semibold">Sun</span>
                                        <span className="font-semibold">Mon</span>
                                        <span className="font-semibold">Tue</span>
                                        <span className="font-semibold">Wed</span>
                                        <span className="font-semibold">Thu</span>
                                        <span className="font-semibold">Fri</span>
                                        <span className="font-semibold">Sat</span>
                                    </div>

                                    {/* Calendar 1 grid */}
                                    <div className="grid grid-cols-7 text-xs text-center text-gray-900">
                                        {paddedDays1.map((day, dayIndex) => (
                                            <span 
                                                key={dayIndex} 
                                                onClick={() => day && selectDate(day, 1)}
                                                className={`
                                                    flex items-center justify-center w-10 h-10 rounded-lg cursor-pointer
                                                    ${day === today.getDate() && currentMonth1 === today.getMonth() && currentYear1 === today.getFullYear() ? 'font-semibold' : ''}
                                                    ${isStartDate(day, currentMonth1, currentYear1) ? 'bg-blue-600 text-white' : ''}
                                                    ${isEndDate(day, currentMonth1, currentYear1) ? 'bg-blue-600 text-white' : ''}
                                                    ${isDateInRange(day, currentMonth1, currentYear1) && !isStartDate(day, currentMonth1, currentYear1) && !isEndDate(day, currentMonth1, currentYear1) ? 'bg-blue-100' : 'hover:bg-blue-100'}
                                                `}
                                            >
                                                {day || ''}
                                            </span>
                                        ))}
                                    </div>

                                    {renderCalendar1()}
                                </div>

                                {/* Second Calendar */}
                                <div className="flex flex-col px-6 pt-5 pb-6 border-b border-gray-100 mb-4 md:mb-0 md:border-l md:border-b-0 relative">
                                    <div className="flex items-center justify-between">
                                        {/* Previous month navigation button */}
                                        <button onClick={() => prevMonth(setCurrentMonth2, setCurrentYear2)} className="flex items-center justify-center p-2 rounded-xl hover:bg-gray-50 cursor-pointer">
                                            <svg className="w-6 h-6 text-gray-900 stroke-current" fill="none">
                                                <path d="M13.25 8.75L9.75 12l3.5 3.25" strokeWidth="1.5" strokeLinecap="round"
                                                    strokeLinejoin="round" />
                                            </svg>
                                        </button>
                                        {/* Calendar 2 header with year and month */}
                                        <div className="flex items-center">
                                            <button
                                                onClick={() => toggleCalendar2View('years')}
                                                className="px-2 py-1 text-sm font-semibold hover:bg-gray-50 hover:text-blue-600 cursor-pointer"
                                            >
                                                {currentYear2}
                                            </button>
                                            <button
                                                onClick={() => toggleCalendar2View('months')}
                                                className="px-2 py-1 text-sm font-semibold hover:bg-gray-50 hover:text-blue-600 cursor-pointer"
                                            >
                                                {months[currentMonth2]}
                                            </button>
                                        </div>
                                        {/* Next month navigation button */}
                                        <button onClick={() => nextMonth(setCurrentMonth2, setCurrentYear2)} className="flex items-center justify-center p-2 rounded-xl hover:bg-gray-50 cursor-pointer">
                                            <svg className="w-6 h-6 text-gray-900 stroke-current" fill="none">
                                                <path d="M10.75 8.75l3.5 3.25-3.5 3.25" strokeWidth="1.5" strokeLinecap="round"
                                                    strokeLinejoin="round" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Days of the week header */}
                                    <div className="grid grid-cols-7 text-xs text-center text-gray-900 mt-4">
                                        <span className="font-semibold">Sun</span>
                                        <span className="font-semibold">Mon</span>
                                        <span className="font-semibold">Tue</span>
                                        <span className="font-semibold">Wed</span>
                                        <span className="font-semibold">Thu</span>
                                        <span className="font-semibold">Fri</span>
                                        <span className="font-semibold">Sat</span>
                                    </div>

                                    {/* Calendar 2 grid */}
                                    <div className="grid grid-cols-7 text-xs text-center text-gray-900">
                                        {paddedDays2.map((day, dayIndex) => (
                                            <span 
                                                key={dayIndex} 
                                                onClick={() => day && selectDate(day, 2)}
                                                className={`
                                                    flex items-center justify-center w-10 h-10 rounded-lg cursor-pointer
                                                    ${day === today.getDate() && currentMonth2 === today.getMonth() && currentYear2 === today.getFullYear() ? 'font-semibold' : ''}
                                                    ${isStartDate(day, currentMonth2, currentYear2) ? 'bg-blue-600 text-white' : ''}
                                                    ${isEndDate(day, currentMonth2, currentYear2) ? 'bg-blue-600 text-white' : ''}
                                                    ${isDateInRange(day, currentMonth2, currentYear2) && !isStartDate(day, currentMonth2, currentYear2) && !isEndDate(day, currentMonth2, currentYear2) ? 'bg-blue-100' : 'hover:bg-blue-100'}
                                                `}
                                            >
                                                {day || ''}
                                            </span>
                                        ))}
                                    </div>

                                    {renderCalendar2()}
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row items-center justify-between px-6 py-4 gap-3 md:gap-0">
                                <div className="flex items-center mb-2 sm:mb-0">
                                    <input
                                        type="text"
                                        value={startDateFormatted}
                                        className="w-32 px-4 py-2 text-xs text-gray-900 rounded-lg bg-gray-50 focus:bg-white focus:ring-1 focus:ring-blue-600 focus:outline-none"
                                        placeholder="Start Date"
                                        disabled
                                    />
                                    <div className="p-1">
                                        <svg className="w-6 h-6 text-gray-900 stroke-current" fill="none">
                                            <path d="M6.738 12.012h10.5m-4.476 4.25l4.5-4.25-4.5-4.25" strokeWidth="1.5"
                                                strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        value={endDateFormatted}
                                        className="w-32 px-4 py-2 text-xs text-gray-900 rounded-lg bg-gray-50 focus:bg-white focus:ring-1 focus:ring-blue-600 focus:outline-none"
                                        placeholder="End Date"
                                        disabled
                                    />
                                </div>
                                <div className="flex items-center mt-2 sm:mt-0 space-x-2">
                                    <button
                                        className="px-4 py-2 text-xs cursor-pointer rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-600 hover:bg-gray-100"
                                        onClick={() => setShowDateRangePicker(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="px-4 py-2 text-xs cursor-pointer text-white bg-blue-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 hover:bg-blue-700"
                                        onClick={setDateRange}
                                    >
                                        Set Date
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DateRangePicker;