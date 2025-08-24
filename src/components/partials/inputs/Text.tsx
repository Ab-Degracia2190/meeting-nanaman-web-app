import React from 'react';

interface TextInputProps {
    label?: string;
    placeholder?: string;
    className?: string;
    required?: boolean;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    disabled?: boolean;
}

const TextInput: React.FC<TextInputProps> = ({
    label,
    placeholder,
    className = "",
    required = false,
    value = "",
    onChange,
    error,
    disabled = false,
}) => {
    return (
        <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1">
                {label && (
                    <label className="text-[10px] md:text-xs text-gray-700 dark:text-gray-300">
                        {label}
                    </label>
                )}
                {required && (
                    <span className="text-[10px] md:text-xs text-red-400">*</span>
                )}
            </div>
            <input 
                type="text" 
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className={`py-2 px-3 text-[10px] md:text-xs border rounded-md transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500
                    ${
                        error 
                            ? 'border-red-500 focus:border-red-600 focus:ring-red-200 dark:focus:ring-red-800'
                            : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-200 dark:focus:ring-blue-900'
                    } focus:outline-none focus:ring-2 ${
                        disabled ? 'opacity-50 cursor-not-allowed' : ''
                    } ${className}`} 
                disabled={disabled}
                required={required}
                aria-invalid={!!error}
                aria-describedby={error ? `${label}-error` : undefined}
            />
            {error && (
                <span 
                    id={`${label}-error`}
                    className="text-red-500 dark:text-red-400 text-[8px]"
                    role="alert"
                >
                    {error}
                </span>
            )}
        </div>
    );
};

export default TextInput;