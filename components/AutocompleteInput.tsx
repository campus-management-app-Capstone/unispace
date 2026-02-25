import React, { useState } from "react";

// Define the shape of your search list items
type SearchItem = { show: string; value: string };

// Define the props this component needs to work
interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon: React.ReactNode;
  searchList: SearchItem[];
  hasConnector?: boolean;
}

export const AutocompleteInput = ({
  value,
  onChange,
  placeholder,
  icon,
  searchList,
  hasConnector = false,
}: AutocompleteInputProps) => {
  const [isFocused, setIsFocused] = useState(false);

  const filteredList = searchList.filter((item) =>
    item.show.toLowerCase().includes(value.toLowerCase())
  );

  return (
    <div className="relative group">
      {/* Dynamic Icon */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center">
        {icon}
      </div>

      {/* Connecting Line (Only shows if hasConnector is true) */}
      {hasConnector && (
        <div className="absolute left-[1.1rem] top-8 h-6 border-l-2 border-dotted border-gray-300"></div>
      )}

      <input
        type="text"
        placeholder={placeholder}
        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />

      {/* Dropdown Menu */}
      {isFocused && value && filteredList.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filteredList.map((item, index) => (
            <li
              key={index}
              onMouseDown={() => {
                onChange(item.value); // Sends the selection back to the parent
                setIsFocused(false);
              }}
              className="px-4 py-2 text-sm cursor-pointer hover:bg-blue-50 text-gray-700"
            >
              {item.show}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};