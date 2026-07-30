/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'motion/react';
import Lenis from 'lenis';
import LoadingScreen from './components/LoadingScreen';
import Navbar from './components/Navbar';
import ContactModal from './components/ContactModal';
import CustomCursor from './components/CustomCursor';
import Hero from './components/Hero';
import SelectedWorks from './components/SelectedWorks';
import Expertise from './components/Expertise';
import TerminalSection from './components/TerminalSection';
import Stats from './components/Stats';
import Footer from './components/Footer';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isContactOpen, setIsContactOpen] = useState(false);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Simple scroll top on reload and Lenis smooth scroll
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div className="bg-bg selection:bg-text-primary selection:text-bg">
      <CustomCursor />
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 z-[100] origin-left accent-gradient"
        style={{ scaleX }}
      />
      
      <AnimatePresence mode="wait">
        {isLoading && (
          <LoadingScreen onComplete={() => setIsLoading(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isContactOpen && (
          <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
        )}
      </AnimatePresence>

      <div className={isLoading ? "h-screen overflow-hidden" : ""}>
        <Navbar 
          onOpenContact={() => setIsContactOpen(true)} 
        />
        
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <Hero 
            onOpenContact={() => setIsContactOpen(true)} 
          />
          <SelectedWorks />
          <Expertise />
          <TerminalSection />
          <Stats />
          <Footer />
        </motion.main>
      </div>
    </div>
  );
}


