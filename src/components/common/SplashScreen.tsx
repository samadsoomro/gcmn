import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onComplete?: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onComplete?.();
      }, 500);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Background with Pakistan Flag Colors */}
          <div className="absolute inset-0 flex">
            <motion.div
              className="flex-[3] bg-gradient-to-br from-pakistan-green-darkest to-pakistan-green"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
            <motion.div
              className="flex-1 bg-gradient-to-br from-white to-gray-50"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-xl px-8">
            {/* Book Animation */}
            <motion.div
              className="relative w-48 h-48 flex items-center justify-center mb-12"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              style={{ perspective: '1000px' }}
            >
              {/* Left Book */}
              <motion.div
                className="absolute text-white drop-shadow-2xl"
                style={{ left: '30%', transformStyle: 'preserve-3d' }}
                initial={{ rotateY: 0 }}
                animate={{ rotateY: -30 }}
                transition={{ duration: 1, delay: 0.8 }}
              >
                <BookOpen size={80} />
              </motion.div>

              {/* Right Book */}
              <motion.div
                className="absolute text-white drop-shadow-2xl"
                style={{ right: '30%', transformStyle: 'preserve-3d' }}
                initial={{ rotateY: 0 }}
                animate={{ rotateY: 30 }}
                transition={{ duration: 1, delay: 0.8 }}
              >
                <BookOpen size={80} />
              </motion.div>

              {/* Floating Pages */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-10 h-16 bg-gradient-to-br from-white to-gray-100 rounded"
                  style={{
                    top: '50%',
                    left: `${35 + i * 10}%`,
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                  }}
                  initial={{ y: 0, opacity: 0, rotate: 0 }}
                  animate={{
                    y: [-20, -60, -100],
                    opacity: [0, 1, 0],
                    rotate: [0, 10, -10],
                  }}
                  transition={{
                    duration: 2,
                    delay: 1 + i * 0.3,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                />
              ))}

              {/* Sparkles */}
              <motion.div
                className="absolute -top-4 -right-4 text-pakistan-gold"
                initial={{ scale: 0, rotate: 0 }}
                animate={{ scale: [0, 1, 1.2, 1], rotate: [0, 360] }}
                transition={{ duration: 1.5, delay: 1.2 }}
              >
                <Sparkles size={32} />
              </motion.div>
            </motion.div>

            {/* Logo */}
            <motion.div
              className="mb-6"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.5 }}
            >
              <div className="w-24 h-24 rounded-2xl bg-white shadow-xl flex items-center justify-center overflow-hidden animate-pulse-glow">
                <img
                  src="/college-logo.png"
                  alt="GCMN Logo"
                  className="w-20 h-20 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              className="text-3xl md:text-4xl font-bold text-white text-center mb-2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.8 }}
            >
              GCMN Library
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-lg text-white/80 text-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 2 }}
            >
              Gov. College For Men Nazimabad
            </motion.p>

            {/* Loading Indicator */}
            <motion.div
              className="mt-8 flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.2 }}
            >
              <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '300ms' }} />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
