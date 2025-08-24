interface CheckboxInputProps {
    label?: string;
    className?: string;
    required?: boolean;
}

const CheckboxInput: React.FC<CheckboxInputProps> = ({ label, className = "", required }) => {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <input 
                type="checkbox" 
                className="w-4 h-4 border border-gray-300 rounded" 
            />
            {label && (
                <label className="text-xs text-gray-700 flex items-center gap-1">
                    {label} {required && <span className="text-red-400">*</span>}
                </label>
            )}
        </div>
    );
};

export default CheckboxInput;