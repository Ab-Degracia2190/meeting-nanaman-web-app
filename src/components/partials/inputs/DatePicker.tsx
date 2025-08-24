import React, { useState, useEffect } from 'react';

interface DatePickerProps {
    label?: string;
    placeholder?: string;
    className?: string;
    required?: boolean;
    value?: string;
    disabled?: boolean;
    error?: string;
    onChange?: (value: string) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({
    label,
    placeholder = 'Select Date',
    className = '',
    required = false,
    value = '',
    disabled = false,
    error,
    onChange
}) => {
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showYearsRange, setShowYearsRange] = useState(false);
    const [showMonthsRange, setShowMonthsRange] = useState(false);
    const [selectedDate, setSelectedDate] = useState(value);
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    useEffect(() => {
        setSelectedDate(value);
    }, [value]);

    useEffect(() => {
        if (onChange && selectedDate !== value) {
            onChange(selectedDate);
        }
    }, [selectedDate, onChange, value]);

    const currentMonthDays = () => {
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        return Array.from({ length: daysInMonth }, (_, i) => i + 1);
    };

    const paddedDays = () => {
        const startDay = new Date(currentYear, currentMonth, 1).getDay();
        return Array(startDay).fill(null).concat(currentMonthDays());
    };

    const todaysYear = [currentYear];

    const yearsRange = () => {
        const current = currentYear;
        const rangeStart = current - 10;
        const rangeEnd = current + 10;
        const years = [];
        for (let year = rangeStart; year <= rangeEnd; year++) {
            years.push(year);
        }
        return years;
    };

    const prevYear = () => {
        setCurrentYear(prev => prev - 1);
    };

    const nextYear = () => {
        setCurrentYear(prev => prev + 1);
    };

    const prevMonth = () => {
        setCurrentMonth(prev => (prev - 1 + 12) % 12);
    };

    const nextMonth = () => {
        setCurrentMonth(prev => (prev + 1) % 12);
    };

    const toggleShowMonths = () => {
        setShowMonthsRange(prev => {
            const newValue = !prev;
            if (newValue) {
                setShowYearsRange(false);
            }
            return newValue;
        });
    };

    const toggleShowYears = () => {
        setShowYearsRange(prev => {
            const newValue = !prev;
            if (newValue) {
                setShowMonthsRange(false);
            }
            return newValue;
        });
    };

    const showPrevYears = () => {
        const firstYear = yearsRange()[0];
        setCurrentYear(firstYear - 1);
    };

    const showNextYears = () => {
        const lastYear = yearsRange()[yearsRange().length - 1];
        setCurrentYear(lastYear + 1);
    };

    const selectDate = (day: number) => {
        const selectedMonth = currentMonth;
        const selectedYear = currentYear;
        const selectedDateObj = new Date(selectedYear, selectedMonth, day);
        const formattedDate = selectedDateObj.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        setSelectedDate(formattedDate);
        setShowDatePicker(false);
    };

    return (
        <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1">
                {label && <label className="text-[10px] md:text-xs text-gray-700">{label}</label>}
                {required && <span className="text-[10px] md:text-xs text-red-400">*</span>}
            </div>

            <div className="relative">
                <div
                    onClick={() => !disabled && setShowDatePicker(true)}
                    className={`py-2 px-4 text-[10px] md:text-xs border border-gray-300 rounded-md flex items-center ${className} ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white cursor-pointer'
                        }`}
                >
                    {selectedDate || placeholder}
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
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

                {error && <div className="text-[10px] md:text-xs text-red-400 mt-1">{error}</div>}
            </div>

            {/* Date picker popup */}
            {showDatePicker && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowDatePicker(false)}></div>
                    <div className="flex bg-white shadow-lg rounded-xl z-50">
                        {/* Conditional rendering of month/year ranges */}
                        {(showMonthsRange || showYearsRange) && (
                            <div className="py-6">
                                <div className="overflow-y-auto content-scroll max-h-80 w-25">
                                    {showMonthsRange && (
                                        <ul className="flex flex-col text-[10px] md:text-xs">
                                            {months.map((month, index) => (
                                                <li key={index}>
                                                    <button
                                                        onClick={() => {
                                                            setCurrentMonth(index);
                                                            setShowMonthsRange(false);
                                                        }}
                                                        className={`px-6 py-1.5 w-full leading-5 hover:bg-gray-50 hover:text-blue-600 text-left cursor-pointer ${currentMonth === index ? 'font-semibold' : ''
                                                            }`}
                                                    >
                                                        {month}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    {showYearsRange && (
                                        <ul className="flex flex-col text-[10px] md:text-xs">
                                            {yearsRange().length > 20 && (
                                                <li>
                                                    <button
                                                        onClick={showPrevYears}
                                                        className="px-6 py-1.5 w-full flex justify-center items-center leading-5 hover:bg-gray-50 hover:text-blue-600 text-left font-semibold cursor-pointer"
                                                    >
                                                        <svg className="svg-icon"
                                                            style={{ width: '1em', height: '1em', verticalAlign: 'middle', fill: 'currentColor', overflow: 'hidden' }}
                                                            viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
                                                            <path
                                                                d="M768 785.066667a17.015467 17.015467 0 0 1-12.066133-5.000534L512 536.132267 268.066133 780.066133a17.0496 17.0496 0 1 1-24.132266-24.132266l256-256a17.0496 17.0496 0 0 1 24.132266 0l256 256A17.0496 17.0496 0 0 1 768 785.066667z m0-256a17.015467 17.015467 0 0 1-12.066133-5.000534L512 280.132267 268.066133 524.066133a17.0496 17.0496 0 1 1-24.132266-24.132266l256-256a17.0496 17.0496 0 0 1 24.132266 0l256 256A17.0496 17.0496 0 0 1 768 529.066667z" />
                                                        </svg>
                                                    </button>
                                                </li>
                                            )}
                                            {yearsRange().map((year, index) => (
                                                <li key={index}>
                                                    <button
                                                        onClick={() => {
                                                            setCurrentYear(year);
                                                            setShowYearsRange(false);
                                                        }}
                                                        className={`px-6 py-1.5 w-full leading-5 hover:bg-gray-50 hover:text-blue-600 text-left cursor-pointer ${currentYear === year ? 'font-semibold' : ''
                                                            }`}
                                                    >
                                                        {year}
                                                    </button>
                                                </li>
                                            ))}
                                            {yearsRange().length > 20 && (
                                                <li>
                                                    <button
                                                        onClick={showNextYears}
                                                        className="px-6 py-1.5 w-full flex justify-center items-center leading-5 hover:bg-gray-50 hover:text-blue-600 text-left font-semibold cursor-pointer"
                                                    >
                                                        <svg className="svg-icon"
                                                            style={{ width: '1em', height: '1em', verticalAlign: 'middle', fill: 'currentColor', overflow: 'hidden' }}
                                                            viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
                                                            <path
                                                                d="M512 785.066667a17.015467 17.015467 0 0 1-12.066133-5.000534l-256-256a17.0496 17.0496 0 1 1 24.132266-24.132266L512 743.867733l243.933867-243.933866a17.0496 17.0496 0 1 1 24.132266 24.132266l-256 256A17.015467 17.015467 0 0 1 512 785.066667z m0-256a17.015467 17.015467 0 0 1-12.066133-5.000534l-256-256a17.0496 17.0496 0 1 1 24.132266-24.132266L512 487.867733l243.933867-243.933866a17.0496 17.0496 0 1 1 24.132266 24.132266l-256 256A17.015467 17.015467 0 0 1 512 529.066667z" />
                                                        </svg>
                                                    </button>
                                                </li>
                                            )}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Dynamic month calendar display */}
                        <div className="flex flex-col rounded-md">
                            <div className="flex divide-x">
                                <div className="flex flex-col px-6 pt-5 pb-6">
                                    <div className="flex items-center justify-between">
                                        {/* Previous year navigation button */}
                                        <button
                                            onClick={prevYear}
                                            className="flex items-center justify-center p-2 rounded-xl hover:bg-gray-50 cursor-pointer"
                                        >
                                            <svg className="w-6 h-6 text-gray-900 stroke-current" fill="none">
                                                <path d="M13.25 8.75L9.75 12l3.5 3.25" strokeWidth="1.5" strokeLinecap="round"
                                                    strokeLinejoin="round" />
                                            </svg>
                                        </button>
                                        {/* Current year display */}
                                        {todaysYear.map((year, index) => (
                                            <div key={index}>
                                                <button
                                                    onClick={toggleShowYears}
                                                    className={`px-6 py-1.5 w-full leading-5 hover:bg-gray-50 hover:text-blue-600 text-left cursor-pointer ${currentYear === year ? 'font-semibold' : ''
                                                        }`}
                                                >
                                                    {year}
                                                </button>
                                            </div>
                                        ))}
                                        {/* Next year navigation button */}
                                        <button
                                            onClick={nextYear}
                                            className="flex items-center justify-center p-2 rounded-xl hover:bg-gray-50 cursor-pointer"
                                        >
                                            <svg className="w-6 h-6 text-gray-900 stroke-current" fill="none">
                                                <path d="M10.75 8.75l3.5 3.25-3.5 3.25" strokeWidth="1.5"
                                                    strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        {/* Previous month navigation button */}
                                        <button
                                            onClick={prevMonth}
                                            className="flex items-center justify-center p-2 rounded-xl hover:bg-gray-50 cursor-pointer"
                                        >
                                            <svg className="w-6 h-6 text-gray-900 stroke-current" fill="none">
                                                <path d="M13.25 8.75L9.75 12l3.5 3.25" strokeWidth="1.5" strokeLinecap="round"
                                                    strokeLinejoin="round" />
                                            </svg>
                                        </button>
                                        {/* Current month display */}
                                        <div className="text-sm font-semibold">
                                            <button
                                                onClick={toggleShowMonths}
                                                className={`px-6 py-1.5 w-full leading-5 hover:bg-gray-50 hover:text-blue-600 text-left cursor-pointer ${showYearsRange ? 'font-semibold' : ''
                                                    }`}
                                            >
                                                {months[currentMonth]}
                                            </button>
                                        </div>
                                        {/* Next month navigation button */}
                                        <button
                                            onClick={nextMonth}
                                            className="flex items-center justify-center p-2 rounded-xl hover:bg-gray-50 cursor-pointer"
                                        >
                                            <svg className="w-6 h-6 text-gray-900 stroke-current" fill="none">
                                                <path d="M10.75 8.75l3.5 3.25-3.5 3.25" strokeWidth="1.5"
                                                    strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Days of the week header */}
                                    <div className="grid grid-cols-7 text-[10px] md:text-xs text-center text-gray-900">
                                        <span className="font-semibold">Sun</span>
                                        <span className="font-semibold">Mon</span>
                                        <span className="font-semibold">Tue</span>
                                        <span className="font-semibold">Wed</span>
                                        <span className="font-semibold">Thu</span>
                                        <span className="font-semibold">Fri</span>
                                        <span className="font-semibold">Sat</span>
                                    </div>

                                    {/* Calendar grid */}
                                    <div className="grid grid-cols-7 text-[10px] md:text-xs text-center text-gray-900">
                                        {paddedDays().map((day, dayIndex) => (
                                            <span
                                                key={dayIndex}
                                                onClick={() => day && selectDate(day)}
                                                className={`flex items-center justify-center w-10 h-10 rounded-lg ${day ? 'cursor-pointer' : ''} ${day === today.getDate() && currentMonth === today.getMonth()
                                                        ? 'font-semibold bg-blue-100'
                                                        : ''
                                                    } ${day ? 'hover:bg-blue-100' : ''}`}
                                            >
                                                {day || ''}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DatePicker;