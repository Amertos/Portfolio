import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import NewsGrid from './components/NewsGrid';
import ShopTeaser from './components/ShopTeaser';
import Partners from './components/Partners';
import Footer from './components/Footer';
import CustomCursor from './components/CustomCursor';
import { AnimatePresence, motion } from 'framer-motion';
import { LanguageProvider } from './context/LanguageContext';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <LanguageProvider>
      <div className="bg-[#0A0A0A] min-h-screen text-white overflow-x-hidden selection-neon relative">
        <CustomCursor />
        
        <AnimatePresence>
          {loading ? (
            <motion.div
              key="loader"
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-[#D1F000] flex items-center justify-center"
            >
              <h1 className="text-black text-6xl md:text-9xl font-black italic tracking-tighter animate-pulse">
                AMER
              </h1>
            </motion.div>
          ) : (
            <>
              <Navbar />
              <Hero />
              <NewsGrid />
              <ShopTeaser />
              <Partners />
              <Footer />
            </>
          )}
        </AnimatePresence>
      </div>
    </LanguageProvider>
  );
};

export default App;