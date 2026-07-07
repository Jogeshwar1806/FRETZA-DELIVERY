import React from 'react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  onClear?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search for dishes or restaurants...',
  onClear,
}) => {
  return (
    <div className="w-full relative flex items-center bg-surface-container-low border border-outline-variant/10 rounded-full px-5 py-3.5 focus-within:bg-white focus-within:border-primary-container focus-within:shadow-md transition-all duration-300">
      <span className="material-symbols-outlined text-secondary mr-3 text-[22px]">search</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-sm text-on-surface placeholder:text-secondary-fixed-dim"
      />
      {value && (
        <button
          onClick={onClear}
          className="absolute right-4 p-1 rounded-full text-secondary hover:text-on-surface hover:bg-gray-100 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      )}
    </div>
  );
};
