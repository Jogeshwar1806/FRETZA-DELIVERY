import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MOCK_CATEGORIES } from '../constants/mockData';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [searchVal, setSearchVal] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchVal)}`);
    } else {
      navigate('/home');
    }
  };

  return (
    <div className="w-full bg-background min-h-screen pb-20">
      {/* Hero Section */}
      <section className="relative min-h-[85dvh] flex flex-col justify-end overflow-hidden px-gutter pb-xl pt-lg">
        <div className="absolute inset-0 z-0">
          <img
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPWT-waWRecQTq2KTGIgFv1spM-RjnQoa3yYSfAFFfZmj6g-OoEvWgIGdefOK81StIgnTneOpt8ewhRYRtK0JGy5asUh5mZnYAVdqamWkgtgU1jqDOJ7Pk7PiMiYiLJnokWg38hDgg00N2PZ_KjDumajStsZN5r21Q3_WAxPNaOv0Z4WpSCFUiXTzRaUBCHtNC42qK1v55rhvj2UIg5Oeo7sOh5x4nhEN2v7bJ23GwyR_hhFY1Mh3fNGePQ2opLlcY9dmXk9eGGA"
            alt="Delicious burger and fries on table"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
        </div>

        <div className="relative z-10 space-y-md max-w-lg mt-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-primary/20"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
            <span className="font-label-sm text-[11px] text-primary uppercase tracking-wider font-bold">Now Serving Khunta</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display-lg text-4xl md:text-5xl text-on-surface leading-tight font-black"
          >
            Fast. <span className="text-primary">Fresh.</span> <br />Local.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-body-lg text-sm md:text-base text-on-surface-variant max-w-sm"
          >
            Bringing the best local flavors of Khunta straight to your doorstep in under 20 minutes.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="pt-4 flex flex-col sm:flex-row gap-3 w-full"
          >
            <button
              onClick={() => navigate('/home')}
              className="w-full sm:w-auto py-4 px-8 bg-primary-container text-white font-headline-md text-sm md:text-base rounded-xl shadow-lg hover:bg-orange-600 transition-all active:scale-[0.98] font-bold text-center"
            >
              Get Started
            </button>
            <button
              onClick={() => navigate('/home')}
              className="w-full sm:w-auto py-4 px-8 bg-white/80 backdrop-blur-md text-on-surface border border-outline-variant font-label-md text-sm md:text-base rounded-xl hover:bg-surface-container-low transition-all font-semibold text-center"
            >
              Browse Restaurants
            </button>
          </motion.div>
        </div>
      </section>

      {/* Quick Search Widget */}
      <section className="px-gutter -mt-8 relative z-20 max-w-xl mx-auto">
        <form onSubmit={handleSearchSubmit} className="bg-white/90 backdrop-blur-xl p-5 rounded-2xl shadow-xl border border-white space-y-4">
          <div className="flex items-center gap-3 bg-surface-container-low rounded-xl px-4 py-3">
            <span className="material-symbols-outlined text-secondary">search</span>
            <input
              type="text"
              placeholder="Search for food or grocery..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="bg-transparent border-none focus:outline-none focus:ring-0 font-body-md text-xs md:text-sm w-full placeholder:text-secondary-fixed-dim"
            />
          </div>

          {/* Quick categories horizontal scroll */}
          <div className="flex gap-4 overflow-x-auto hide-scrollbar py-1">
            {MOCK_CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => navigate(`/categories?c=${cat.id}`)}
                className="flex-shrink-0 flex flex-col items-center gap-1.5 px-1"
              >
                <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-secondary hover:text-primary hover:bg-orange-50 transition-colors">
                  <span className="material-symbols-outlined text-[24px]">{cat.icon}</span>
                </div>
                <span className="font-label-sm text-[10px] text-on-surface font-semibold">{cat.name}</span>
              </button>
            ))}
          </div>
        </form>
      </section>

      {/* Why FRETZA? Bento Grid */}
      <section className="px-gutter py-12 space-y-6 max-w-4xl mx-auto">
        <h2 className="font-headline-lg text-xl md:text-2xl text-on-surface font-bold text-center">Why FRETZA?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Benefit 1 */}
          <div className="bg-white p-6 rounded-2xl border border-outline-variant/10 shadow-sm relative overflow-hidden group">
            <span className="material-symbols-outlined text-primary text-4xl mb-3 block" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
            <h3 className="font-headline-md text-base text-on-surface mb-1 font-bold">Lightning Fast</h3>
            <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
              Our riders know every shortcut in Khunta. Average delivery in 18 minutes.
            </p>
            <div className="absolute -right-8 -bottom-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
              <span className="material-symbols-outlined text-[100px]">speed</span>
            </div>
          </div>
          {/* Benefit 2 */}
          <div className="bg-orange-50 p-6 rounded-2xl flex flex-col justify-between border border-orange-100">
            <span className="material-symbols-outlined text-primary text-4xl mb-3 block" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
            <div>
              <h3 className="font-label-md text-base text-primary font-bold mb-1">Local Favorites</h3>
              <p className="font-body-sm text-xs text-orange-850 opacity-90 leading-relaxed">
                We bundle the best-rated restaurants and sweet stalls in Khunta.
              </p>
            </div>
          </div>
          {/* Benefit 3 */}
          <div className="bg-gray-50 p-6 rounded-2xl flex flex-col justify-between border border-gray-100">
            <span className="material-symbols-outlined text-secondary text-4xl mb-3 block" style={{ fontVariationSettings: "'FILL' 1" }}>savings</span>
            <div>
              <h3 className="font-label-md text-base text-on-surface font-bold mb-1">Pocket Friendly</h3>
              <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                Enjoy hot, fresh food with zero hidden surcharges or delivery markups.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
