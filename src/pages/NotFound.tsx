import React from 'react';
import { Link } from 'react-router-dom';

export const NotFound: React.FC = () => {
  return (
    <div className="px-gutter py-20 text-center space-y-6 max-w-sm mx-auto">
      <span className="material-symbols-outlined text-[80px] text-primary animate-bounce">
        sentiment_very_dissatisfied
      </span>
      <div className="space-y-2">
        <h2 className="font-headline-lg text-2xl text-on-surface font-black">404 — Page Missing</h2>
        <p className="text-secondary font-body-sm text-xs leading-relaxed">
          The page you requested does not exist or has been relocated from Khunta.
        </p>
      </div>

      <Link
        to="/home"
        className="block w-full py-3 bg-primary text-white text-center font-bold rounded-xl text-xs hover:bg-orange-600 transition-all shadow-md"
      >
        Go Back Home
      </Link>
    </div>
  );
};
