import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'motion/react';

export default function CustomCursor() {
  const [hoverState, setHoverState] = useState<{ active: boolean; text: string }>({ active: false, text: '' });

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Smooth spring configuration for fluid movement
  const springConfig = { damping: 25, stiffness: 400, mass: 0.5 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactable = target.closest('a, button, input, textarea, [role="button"], .magnetic-wrap');
      
      if (interactable) {
        let text = '';
        if (interactable.hasAttribute('data-cursor')) {
          text = interactable.getAttribute('data-cursor') || '';
        }
        setHoverState({ active: true, text });
      } else {
        setHoverState({ active: false, text: '' });
      }
    };

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [cursorX, cursorY]);

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9999] hidden md:flex items-center justify-center"
      style={{ x: smoothX, y: smoothY }}
    >
      <motion.div
        animate={{
          width: hoverState.active ? (hoverState.text ? 'auto' : '64px') : '12px',
          height: hoverState.active ? (hoverState.text ? '32px' : '64px') : '12px',
          backgroundColor: hoverState.active ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 1)',
          backdropFilter: hoverState.active ? 'blur(8px)' : 'blur(0px)',
          border: hoverState.active ? '1px solid rgba(255, 255, 255, 0.2)' : '0px solid rgba(255, 255, 255, 0)',
          padding: hoverState.active && hoverState.text ? '0 16px' : '0',
          x: "-50%",
          y: "-50%"
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="flex items-center justify-center overflow-hidden whitespace-nowrap rounded-full shadow-sm"
      >
        <AnimatePresence mode="wait">
          {hoverState.active && hoverState.text && (
            <motion.span
              key={hoverState.text}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-[10px] font-medium text-white uppercase tracking-widest whitespace-nowrap"
            >
              {hoverState.text}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
