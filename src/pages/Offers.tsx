import React from 'react';
import { MOCK_OFFERS } from '../constants/mockData';
import { OfferBanner } from '../components/OfferBanner';

export const Offers: React.FC = () => {
  return (
    <div className="px-gutter py-6 space-y-6">
      <div>
        <h2 className="font-headline-lg text-xl md:text-2xl text-on-surface font-black">Today's Hot Offers</h2>
        <p className="text-secondary font-body-sm text-xs mt-1">Get massive savings and lightning fast deliveries in Khunta.</p>
      </div>

      {/* Grid view of offers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MOCK_OFFERS.map((offer) => (
          <div key={offer.id} className="w-full">
            <OfferBanner offer={offer} />
            {/* Additional info text block under each banner */}
            <div className="mt-3 bg-white p-4 rounded-xl border border-outline-variant/10 shadow-xs flex items-center justify-between text-xs">
              <div>
                <span className="block font-bold text-on-surface">Code: {offer.code}</span>
                <span className="block text-[10px] text-secondary mt-0.5">Use during checkout to redeem discount</span>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(offer.code);
                  alert(`Code "${offer.code}" copied to clipboard!`);
                }}
                className="text-primary font-bold hover:underline"
              >
                Copy Code
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Seasonal Deals Section */}
      <section className="bg-orange-50/50 border border-orange-100 rounded-3xl p-6 md:p-8 text-center space-y-4 max-w-xl mx-auto mt-8">
        <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>celebration</span>
        <h3 className="font-headline-md text-base text-primary font-black">Khunta Ratha Yatra Carnival!</h3>
        <p className="font-body-sm text-xs text-orange-950 leading-relaxed max-w-sm mx-auto">
          We are launching special traditional sweet menus and free deliveries during the festival season. Check back daily!
        </p>
      </section>
    </div>
  );
};
