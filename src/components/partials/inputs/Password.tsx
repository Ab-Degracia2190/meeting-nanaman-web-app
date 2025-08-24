import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps {
    label?: string;
    placeholder?: string;
    className?: string;
    required?: boolean;
}

const PasswordInput: React.FC<PasswordInputProps> = ({ label, placeholder, className = "", required }) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1">
                {label && <label className="text-[10px] md:text-xs text-gray-700">{label}</label>}
                {required && <span className="text-[10px] md:text-xs text-red-400">*</span>}
            </div>
            <div className="relative">
                <input
                    type={showPassword ? "text" : "password"}
                    placeholder={placeholder}
                    className={`py-2 px-4 text-[10px] md:text-xs border border-gray-300 rounded-md w-full ${className}`}
                />
                <button
                    type="button"
                    className="absolute inset-y-0 right-3 cursor-pointer flex items-center text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                >
                    {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
            </div>
        </div>
    );
};

export default PasswordInput;