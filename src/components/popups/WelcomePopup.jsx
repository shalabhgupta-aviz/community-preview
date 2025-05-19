import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WelcomePopup({ showOnFirstLogin, showOnAutoSignIn }) {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisited');
    const shouldShowPopup = {
      firstLogin: showOnFirstLogin && !hasVisited,
      autoSignIn: showOnAutoSignIn && !hasVisited,
    };

    if (shouldShowPopup.firstLogin || shouldShowPopup.autoSignIn) {
      setShowPopup(true);
      localStorage.setItem('hasVisited', 'true');
      document.body.style.overflow = 'hidden'; // Lock scrolling

      // Set a timer to auto-close the popup after 5 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);

      // Clear the timer if the component unmounts
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = ''; // Restore scrolling
      };
    }
  }, [showOnFirstLogin, showOnAutoSignIn]);

  const handleClose = () => {
    setShowPopup(false);
    document.body.style.overflow = ''; // Restore scrolling when popup is closed
  };

  return (
    <AnimatePresence>
      {showPopup && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-[5px]"
        >
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm mx-auto h-100 border-2 border-[#6E4BEB]">
            <h2 className="text-xl font-bold mb-4">Welcome!</h2>
            <p className="mb-4">Thank you for joining us. We hope you have a great experience!</p>
            <button
              onClick={handleClose}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Close
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
