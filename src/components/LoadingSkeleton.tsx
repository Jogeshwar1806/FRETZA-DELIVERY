import React from 'react';

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-outline-variant/10 overflow-hidden flex flex-col animate-pulse shadow-sm">
      <div className="aspect-[16/9] w-full bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-5 w-3/4 bg-gray-200 rounded-md" />
        <div className="h-4 w-1/2 bg-gray-200 rounded-md" />
        <div className="border-t border-gray-100 pt-3 flex justify-between">
          <div className="h-3 w-1/4 bg-gray-200 rounded-md" />
          <div className="h-3 w-1/4 bg-gray-200 rounded-md" />
        </div>
      </div>
    </div>
  );
};

export const FoodSkeleton: React.FC = () => {
  return (
    <div className="bg-white p-4 rounded-2xl border border-outline-variant/10 flex gap-4 animate-pulse">
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-16 bg-gray-200 rounded-md" />
        <div className="h-5 w-2/3 bg-gray-200 rounded-md" />
        <div className="h-3 w-full bg-gray-200 rounded-md" />
        <div className="h-3 w-5/6 bg-gray-200 rounded-md" />
        <div className="h-4 w-12 bg-gray-200 rounded-md pt-2" />
      </div>
      <div className="w-24 h-24 bg-gray-200 rounded-xl shrink-0 self-center" />
    </div>
  );
};

export const TextSkeleton: React.FC<{ lines?: number }> = ({ lines = 3 }) => {
  return (
    <div className="space-y-2 animate-pulse w-full">
      {Array.from({ length: lines }).map((_, idx) => (
        <div
          key={idx}
          className="h-3.5 bg-gray-200 rounded-md"
          style={{ width: idx === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  );
};
