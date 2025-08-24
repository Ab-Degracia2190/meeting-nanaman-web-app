import React from 'react';

interface PrimaryButtonProps {
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  type = 'button',
  disabled = false,
  loading = false,
  children,
  onClick,
  className = '',
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`cursor-pointer w-full bg-gradient-to-r from-rose-400 to-orange-300 text-white font-semibold py-3 px-6 rounded-lg hover:from-rose-500 hover:to-orange-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${className}`}
    >
      {loading ? (
        <>
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 40 40" height="16" width="16">
            <circle cx="20" cy="20" r="17.5" pathLength="100" strokeWidth="5" fill="none"
                style={{ stroke: "white", opacity: 0.3 }} />
            <circle cx="20" cy="20" r="17.5" pathLength="100" strokeWidth="5" fill="none"
                style={{
                    stroke: "white",
                    strokeDasharray: "25, 75",
                    strokeDashoffset: 0,
                    strokeLinecap: "round"
                }} />
          </svg>
          {children}
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default PrimaryButton;