import React from 'react';
import type { Category } from '../types';

interface CategoryCardProps {
  category: Category;
  isActive: boolean;
  onClick: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 flex flex-col items-center gap-2 px-4 py-2.5 rounded-2xl transition-all duration-300 active:scale-95 ${
        isActive
          ? 'bg-orange-50 text-primary border border-primary-container shadow-sm'
          : 'bg-surface-container text-secondary hover:bg-surface-container-high'
      }`}
    >
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-300 ${
          isActive ? 'bg-primary-container text-white' : 'bg-surface-container-low text-secondary'
        }`}
      >
        <span className="material-symbols-outlined text-[28px]">{category.icon}</span>
      </div>
      <span className={`font-label-sm text-xs ${isActive ? 'text-primary font-bold' : 'text-on-surface'}`}>
        {category.name}
      </span>
    </button>
  );
};
