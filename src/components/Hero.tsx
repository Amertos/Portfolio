import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { gsap } from 'gsap';
import BackgroundVideo from './BackgroundVideo';
import Magnetic from './Magnetic';

const roles = ["Full-Stack Engineer", "AI-Augmented Builder", "Hackathon Champion", "Software Engineering Student"];

interface HeroProps {
  onOpenContact?: () => void;
}

export default function Hero({ onOpenContact }: HeroProps) {
  const [roleIndex, setRoleIndex] = useState(0);
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const roleInterval = setInterval(() => {
      setRoleIndex((prev) => (prev + 1) % roles.length);
    }, 2000);

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(".name-reveal", 
      { opacity: 0, y: 50 }, 
      { opacity: 1, y: 0, duration: 1.2, delay: 0.1 }
    );

    tl.fromTo(".blur-in", 
      { opacity: 0, filter: "blur(10px)", y: 20 }, 
      { opacity: 1, filter: "blur(0px)", y: 0, duration: 1, stagger: 0.1 },
      "-=0.9"
    );

    return () => clearInterval(roleInterval);
  }, []);

  return (
    <section ref={containerRef} id="home" className="relative h-screen flex flex-col justify-center items-center text-center px-6 overflow-hidden">
      <BackgroundVideo />

      <div className="relative z-10 flex flex-col items-center">
        <div className="blur-in text-xs text-muted uppercase tracking-[0.3em] mb-8">
          NOVI PAZAR, SERBIA
        </div>

        <h1 className="name-reveal text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-display italic leading-[0.9] tracking-tight text-text-primary mb-6">
          Amer Biberovic
        </h1>

        <div className="blur-in text-base sm:text-lg md:text-2xl text-text-primary/90 font-light mb-8 min-h-[2rem] flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
          <AnimatePresence mode="wait">
            <motion.span
              key={roleIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="font-display italic text-text-primary px-1 whitespace-nowrap"
            >
              {roles[roleIndex]}
            </motion.span>
          </AnimatePresence>
          at 16.
        </div>

        <p className="blur-in text-sm md:text-base text-muted max-w-xl mb-12">
          Self-taught full-stack engineer who entered a university-level hackathon at 16, outbuilt every technical team, and walked away with 1st place. Shipping production software — not tutorial clones.
        </p>

        <div className="blur-in flex flex-wrap justify-center gap-4">
          <Magnetic>
            <button 
              onClick={() => document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' })}
              data-cursor="SCROLL"
              className="group relative rounded-full overflow-hidden px-7 py-3.5 text-sm transition-transform active:scale-95 cursor-pointer"
            >
              <div className="absolute inset-0 bg-text-primary transition-colors group-hover:bg-bg" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute -inset-[1px] rounded-full accent-gradient" />
                <div className="absolute inset-0 bg-bg rounded-full" />
              </div>
              <span className="relative z-10 font-medium text-bg group-hover:text-text-primary">
                See Works
              </span>
            </button>
          </Magnetic>

          <Magnetic>
            <button 
              onClick={onOpenContact}
              data-cursor="SAY HI"
              className="group relative rounded-full overflow-hidden px-7 py-3.5 text-sm transition-transform active:scale-95 cursor-pointer"
            >
              <div className="absolute inset-0 border-2 border-stroke bg-bg transition-colors" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute -inset-[1px] rounded-full accent-gradient" />
                <div className="absolute inset-0 bg-bg rounded-full" />
              </div>
              <span className="relative z-10 font-medium text-text-primary">
                Reach out...
              </span>
            </button>
          </Magnetic>
        </div>
      </div>


    </section>
  );
}
