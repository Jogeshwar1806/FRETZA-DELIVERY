import React from 'react';
import type { Offer } from '../types';
import { useToast } from '../contexts/ToastContext';

interface OfferBannerProps {
  offer: Offer;
}

export const OfferBanner: React.FC<OfferBannerProps> = ({ offer }) => {
  const { showToast } = useToast();

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(offer.code);
    showToast(`Code "${offer.code}" copied to clipboard!`);
  };

  return (
    <div className="relative w-full h-44 md:h-52 rounded-2xl overflow-hidden shadow-sm group border border-outline-variant/10">
      {/* Background image */}
      <div
        className="bg-cover bg-center w-full h-full transform transition-transform duration-700 group-hover:scale-105"
        style={{ backgroundImage: `url('${offer.bgImage}')` }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-transparent flex flex-col justify-center px-6 md:px-10" />

      {/* Info contents */}
      <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-10 z-10 text-white select-none max-w-[75%] md:max-w-[55%]">
        <span className="inline-block px-2 py-0.5 bg-primary text-white text-[9px] font-extrabold uppercase rounded mb-2 w-fit tracking-wider">
          Limited Deal
        </span>
        <h3 className="font-headline-lg-mobile md:text-[22px] font-black leading-tight text-white mb-1 drop-shadow">
          {offer.title}
        </h3>
        <p className="text-white/80 font-body-sm text-[11px] leading-relaxed drop-shadow mb-3">
          {offer.description}
        </p>

        {/* Copy Coupon Trigger */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary-container text-white font-label-md text-xs rounded-xl w-fit shadow-md hover:bg-orange-600 transition-colors active:scale-95 duration-200"
        >
          <span className="font-bold">{offer.code}</span>
          <span className="material-symbols-outlined text-sm">content_copy</span>
        </button>
      </div>
    </div>
  );
};
