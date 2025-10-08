import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Download, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

interface AppDownloadPopupProps {
  isOpen: boolean;
  onClose: () => void;
  playStoreLink: string;
}

const AppDownloadPopup: React.FC<AppDownloadPopupProps> = ({
  isOpen,
  onClose,
  playStoreLink
}) => {
  const { isDarkMode } = useTheme();
  const [hasShown, setHasShown] = useState(false);

useEffect(() => {
  // Check if popup has been shown before
  const popupShown = sessionStorage.getItem('appDownloadPopupShown');
  if (!popupShown && isOpen) {
    setHasShown(true);
    sessionStorage.setItem('appDownloadPopupShown', 'true');
  }
}, [isOpen]);

  const handleDownloadClick = () => {
    window.open(playStoreLink, '_blank');
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen || !hasShown) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Popup Content */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className={cn(
            "relative bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden",
            isDarkMode && "bg-gray-800"
          )}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className={cn(
              "absolute top-4 right-4 z-10 p-2 rounded-full transition-colors",
              isDarkMode 
                ? "hover:bg-gray-700 text-gray-300" 
                : "hover:bg-gray-100 text-gray-500"
            )}
          >
            <X size={20} />
          </button>

          {/* Content */}
          <div className="p-6 pt-8">
            {/* Logo Section */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <img
                  src="/lovable-uploads/148324a1-946c-4a01-b925-db5cc25fd1dc.png"
                  alt="ByteMe Logo"
                  className="w-20 h-20 rounded-2xl shadow-lg object-cover"
                />
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-2">
                  <Smartphone className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>

            {/* Text Content */}
            <div className="text-center mb-6">
              <h2 className={cn(
                "text-2xl font-bold mb-2",
                isDarkMode ? "text-white" : "text-gray-900"
              )}>
                Get More Bytes!
              </h2>
              <p className={cn(
                "text-sm leading-relaxed",
                isDarkMode ? "text-gray-300" : "text-gray-600"
              )}>
                Download the ByteMe app for the best experience. Get unlimited access to insights, save your favorites, and discover more content creators.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-2 mb-6">
              {[
                  "Add/Follow creators",
                "Unlimited Bytes access",
                "Save your favorites",
                "Add/Follow topics",
                "Personalized recommendations"
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full" />
                  <span className={cn(
                    "text-xs",
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  )}>
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            {/* Download Button */}
            <Button
              onClick={handleDownloadClick}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <Download className="w-4 h-4 mr-2" />
              Download ByteMe App
            </Button>

            {/* Play Store Badge */}
            <div className="mt-4 text-center">
              <p className={cn(
                "text-xs",
                isDarkMode ? "text-gray-400" : "text-gray-500"
              )}>
                Available on Google Play Store
              </p>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600" />
          <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full blur-xl" />
          <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-gradient-to-tr from-purple-500/20 to-blue-600/20 rounded-full blur-xl" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AppDownloadPopup;
