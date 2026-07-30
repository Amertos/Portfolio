import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface NavbarProps {
  onOpenResume?: () => void;
  onOpenContact?: () => void;
}

export default function Navbar({ onOpenResume, onOpenContact }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("Home");
  const navContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      let current = "Home";
      const sections = ["Work", "Expertise", "Terminal"];

      for (const section of [...sections].reverse()) {
        const el = document.getElementById(section.toLowerCase());
        if (el) {
          const rect = el.getBoundingClientRect();
          // If the section top is well within the viewport
          if (rect.top <= window.innerHeight * 0.4) {
            current = section;
            break;
          }
        }
      }
      
      setActiveSection(current);
    };
    window.addEventListener('scroll', handleScroll);
    // Trigger once on mount to set initial state
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (navContainerRef.current) {
      const activeElement = navContainerRef.current.querySelector<HTMLElement>(`[data-link="${activeSection}"]`);
      if (activeElement) {
        // Scroll the active link into the center of the horizontal visible area
        const container = navContainerRef.current;
        const containerRect = container.getBoundingClientRect();
        const activeRect = activeElement.getBoundingClientRect();

        const scrollLeft = activeElement.offsetLeft - container.offsetWidth / 2 + activeRect.width / 2;
        container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
      }
    }
  }, [activeSection]);

  const navLinks = ["Home", "Work", "Expertise", "Terminal"];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 md:pt-6 px-4">
      <div 
        className={cn(
          "inline-flex items-center rounded-full backdrop-blur-md border border-white/10 bg-surface px-2 py-2 transition-all duration-300",
          scrolled ? "shadow-md shadow-black/10" : "shadow-none"
        )}
      >
        {/* Logo */}
        <div className="group relative flex items-center justify-center w-9 h-9">
          <div className="absolute inset-0 rounded-full accent-gradient group-hover:rotate-180 transition-transform duration-700" />
          <div className="absolute inset-[1px] rounded-full bg-bg flex items-center justify-center group-hover:scale-110 transition-transform">
            <span className="font-display italic text-text-primary text-[13px] leading-none mb-[1px]">AB</span>
          </div>
        </div>

        <div className="hidden md:block w-px h-5 bg-stroke mx-1" />

        {/* Links */}
        <div ref={navContainerRef} className="flex items-center relative overflow-x-auto no-scrollbar max-w-[50vw] md:max-w-none">
          {navLinks.map((link) => (
            <a
              key={link}
              data-link={link}
              data-cursor="NAVIGATE"
              href={`#${link.toLowerCase()}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(link.toLowerCase())?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={cn(
                "relative text-xs sm:text-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2 transition-colors inline-block whitespace-nowrap",
                activeSection === link 
                  ? "text-text-primary" 
                  : "text-muted hover:text-text-primary"
              )}
            >
              {activeSection === link && (
                <motion.div
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-md shadow-[0_0_15px_rgba(255,255,255,0.05)] border border-white/10"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10">{link}</span>
            </a>
          ))}
        </div>

        <div className="w-px h-5 bg-stroke mx-1" />

        {/* Action Button */}
        <button 
          onClick={onOpenContact}
          className="group relative flex items-center justify-center h-8 sm:h-auto"
        >
          <div className="absolute -inset-[2px] rounded-full accent-gradient opacity-0 group-hover:opacity-100 transition-opacity blur-[1px]" />
          <div className="relative flex items-center gap-1.5 bg-surface text-text-primary text-xs sm:text-sm rounded-full px-4 py-1.5 sm:py-2 backdrop-blur-md border border-white/5 whitespace-nowrap">
            Say hi <span className="text-[10px] transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">↗</span>
          </div>
        </button>
      </div>
    </nav>
  );
}
