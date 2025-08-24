interface EmailInputProps {
    label?: string;
    placeholder?: string;
    className?: string;
    required?: boolean;
}

const EmailInput: React.FC<EmailInputProps> = ({ label, placeholder, className = "", required }) => {
    return (
        <div className={"flex flex-col gap-0.5"}>
            <div className="flex items-center gap-1">
                {label && <label className="text-[10px] md:text-xs text-gray-700">{label}</label>}
                {required && <span className="text-[10px] md:text-xs text-red-400">*</span>}
            </div>
            <input 
                type="email" 
                placeholder={placeholder} 
                className={`py-2 px-4 text-[10px] md:text-xs border border-gray-300 rounded-md ${className}`} 
            />
        </div>
    );
};

export default EmailInput;