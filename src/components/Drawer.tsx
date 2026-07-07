import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end items-end md:items-center p-0 md:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer Content */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="relative bg-white rounded-t-[2rem] md:rounded-3xl w-full md:max-w-md shadow-2xl overflow-hidden border-t md:border border-outline-variant/20 z-10 flex flex-col max-h-[85vh] md:max-h-[90vh]"
          >
            {/* Grab handle indicator for mobile drawers */}
            <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto my-3 md:hidden shrink-0" />

            {/* Header */}
            <div className="flex justify-between items-center px-6 pb-4 pt-1 md:py-4 border-b border-gray-100 shrink-0">
              {title && <h3 className="font-headline-md text-base text-on-surface font-black">{title}</h3>}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-secondary hover:text-on-surface hover:bg-gray-100 transition-colors ml-auto"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Content Body */}
            <div className="px-6 py-4 overflow-y-auto flex-1 font-body-md text-sm text-on-surface-variant pb-12 md:pb-6">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
