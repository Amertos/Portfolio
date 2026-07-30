import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import BackgroundVideo from './BackgroundVideo';
import Magnetic from './Magnetic';

export default function Footer() {
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const marquee = marqueeRef.current;
    if (!marquee) return;

    gsap.to(marquee, {
      xPercent: -50,
      duration: 40,
      ease: "none",
      repeat: -1
    });
  }, []);

  const socialLinks = [
    { name: "Twitter", url: "https://x.com" },
    { name: "LinkedIn", url: "https://www.linkedin.com/in/amer-biberovic-78099237b/" },
    { name: "GitHub", url: "https://github.com/Amertos" }
  ];

  return (
    <footer className="relative bg-bg pt-24 md:pt-40 pb-8 md:pb-12 overflow-hidden">
      <BackgroundVideo flipped />
      
      <div className="relative z-10 w-full mb-24 md:mb-40">
        <div className="w-full h-px bg-stroke/30 absolute top-0 left-0" />
        <div className="w-full h-px bg-stroke/30 absolute bottom-0 left-0" />
        
        <div className="py-12 md:py-20 overflow-hidden whitespace-nowrap">
          <div ref={marqueeRef} className="inline-flex items-center text-7xl md:text-[140px] lg:text-[180px] font-display italic text-text-primary/50 tracking-tighter leading-none">
            {Array.from({ length: 10 }).map((_, i) => (
              <span key={i} className="flex-shrink-0 px-8 md:px-20">
                BUILDING THE FUTURE •
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-[1240px] mx-auto px-6 md:px-16 text-center">
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-display italic text-text-primary mb-12">
          Let's create something<br /><em>extraordinary.</em>
        </h2>

        <div className="flex flex-col items-center gap-16 md:gap-24">
          <Magnetic>
            <a 
              href="mailto:amerbiberovic12@gmail.com"
              data-cursor="SEND MAIL"
              className="group relative inline-flex items-center justify-center p-[1px] rounded-full overflow-hidden transition-transform active:scale-95"
            >
              <div className="absolute inset-0 accent-gradient opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-surface rounded-full px-10 py-5 text-lg md:text-xl font-medium text-text-primary border border-white/5 transition-colors group-hover:bg-bg">
                amerbiberovic12@gmail.com
              </div>
            </a>
          </Magnetic>

          <div className="w-full flex flex-col md:flex-row items-center justify-between gap-8 pt-8 border-t border-stroke/50">
            <div className="flex flex-wrap justify-center gap-6 md:gap-10">
              {socialLinks.map((social) => (
                <a 
                  key={social.name} 
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs uppercase tracking-widest text-muted hover:text-text-primary transition-colors"
                >
                  {social.name}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <div className="absolute w-2 h-2 rounded-full bg-green-500 animate-ping opacity-60" />
              </div>
              <span className="text-xs text-muted uppercase tracking-[0.2em]">Available for projects</span>
            </div>
          </div>
        </div>
        
        <div className="mt-12 text-[10px] text-muted/30 text-center uppercase tracking-[0.3em]">
          © 2026 AMER BIBEROVIC PORTFOLIO. ALL RIGHTS RESERVED.
        </div>
      </div>
    </footer>
  );
}
