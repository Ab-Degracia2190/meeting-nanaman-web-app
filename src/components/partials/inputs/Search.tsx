import React from "react";
import { Search } from "lucide-react";

interface SearchInputProps {
  placeholder?: string;
  className?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = "Search messages",
  className = "",
  value,
  onChange,
}) => {
  return (
    <div className="p-4">
      <div className="relative text-[10px] md:text-xs">
        <Search className="absolute left-3 top-2.5 h-3 w-3 text-gray-400" />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        />
      </div>
    </div>
  );
};

export default SearchInput;