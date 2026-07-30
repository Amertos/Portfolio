import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Code2, ShieldAlert, Cpu, Database, Sparkles } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import ThreeDCanvas from './ThreeDCanvas';
import { setupSystemArchitecture, setupCyberDefense, setupAgentLoops, setupAlgorithmicBase } from './ThreeDScenes';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
}

function TiltCard({ children, className }: TiltCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Milder rotation for a very professional feel
  const rotateX = useTransform(y, [-0.5, 0.5], [7, -7]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-7, 7]);

  const springX = useSpring(rotateX, { stiffness: 400, damping: 40 });
  const springY = useSpring(rotateY, { stiffness: 400, damping: 40 });

  function onMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  }

  function onMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 50 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true, margin: "-100px" }}
      style={{ perspective: 1200 }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={cn("w-full h-full relative group cursor-default", className)}
    >
      <motion.div
        initial="rest"
        whileHover="hover"
        animate="rest"
        style={{
          rotateX: springX,
          rotateY: springY,
          transformStyle: "preserve-3d"
        }}
        className="w-full h-full absolute inset-0 rounded-[2.5rem] bg-surface border border-stroke"
      >
        {/* Glow effect on hover */}
        <div 
          className="absolute inset-0 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" 
          style={{ 
            background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.03) 0%, transparent 60%)',
            transform: 'translateZ(1px)' 
          }} 
        />
        {children}
      </motion.div>
    </motion.div>
  );
}

export default function Expertise() {
  return (
    <section id="expertise" className="bg-bg py-24 md:py-40 relative border-t border-stroke/30 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-[20%] left-[50%] w-[800px] h-[800px] bg-white/5 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      
      <div className="max-w-[1240px] mx-auto px-6 md:px-10 lg:px-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: "-100px" }}
          className="mb-16 md:mb-24 flex flex-col items-center text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-stroke bg-surface mb-6">
            <Sparkles size={14} className="text-muted" />
            <span className="text-[10px] text-muted uppercase tracking-[0.2em] font-medium">Domain Expertise</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-display italic text-text-primary leading-tight mb-6">
            Technical <em>Core</em>
          </h2>
          <p className="text-muted md:text-lg max-w-xl">
            An interactive spatial overview of my tech stack. Hover to engage the architectural layers of my workflow.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-8">
          
          {/* Card 1: Full-Stack System Architecture */}
          <TiltCard className="md:col-span-8 h-[340px] sm:h-[320px] md:h-[380px] lg:h-[420px]">
            <div className="absolute inset-0 p-6 md:p-12 flex flex-col justify-end md:justify-between overflow-hidden rounded-[2.5rem]" style={{ transformStyle: 'preserve-3d' }}>
              <div style={{ transform: 'translateZ(40px)' }} className="relative z-10 pointer-events-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-muted mb-4 shadow-sm">
                  <Code2 size={14} /> Full-Stack
                </div>
                <h3 className="text-3xl lg:text-4xl font-display italic text-text-primary">System Architecture</h3>
                <p className="text-muted text-sm mt-3 md:mt-4 max-w-sm leading-relaxed">
                  End-to-end applications built for scale. Bringing modern UI/UX to life with reactive frontends, underpinned by bulletproof Supabase and PostgreSQL backend logic.
                </p>
              </div>

              {/* 3D Three.js Scene */}
              <ThreeDCanvas
                sceneSetup={setupSystemArchitecture}
                className="absolute inset-0 pointer-events-none"
                style={{ opacity: 0.65 }}
              />
            </div>
          </TiltCard>

          {/* Card 2: Cyber Defense */}
          <TiltCard className="md:col-span-4 h-[340px] sm:h-[320px] md:h-[380px] lg:h-[420px]">
             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,128,0.04)_0%,transparent_70%)] rounded-[2.5rem] pointer-events-none" />
             <div className="absolute inset-0 p-6 md:p-12 flex flex-col justify-end overflow-hidden rounded-[2.5rem]" style={{ transformStyle: 'preserve-3d' }}>
              <div style={{ transform: 'translateZ(30px)' }} className="relative z-10 pointer-events-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/20 bg-green-500/10 text-xs text-green-500 mb-4 shadow-sm">
                  <ShieldAlert size={14} /> Security
                </div>
                <h3 className="text-2xl lg:text-3xl font-display italic text-text-primary mb-3">Cyber Defense</h3>
                <p className="text-muted text-sm leading-relaxed">
                  Harvard CS50 Cybersecurity & TryHackMe challenges. Implementing rigorous defense paradigms against modern network vulnerabilities.
                </p>
              </div>

              {/* 3D Three.js Scene */}
              <ThreeDCanvas
                sceneSetup={setupCyberDefense}
                className="absolute inset-0 pointer-events-none"
                style={{ opacity: 0.65 }}
              />
             </div>
          </TiltCard>

          {/* Card 3: AI Intelligence */}
          <TiltCard className="md:col-span-4 h-[340px] sm:h-[320px] md:h-[380px] lg:h-[420px]">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.05)_0%,transparent_70%)] rounded-[2.5rem] pointer-events-none" />
            <div className="absolute inset-0 p-6 md:p-12 flex flex-col justify-end overflow-hidden rounded-[2.5rem]" style={{ transformStyle: 'preserve-3d' }}>
              <div style={{ transform: 'translateZ(40px)' }} className="relative z-10 pointer-events-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/10 text-xs text-blue-400 mb-4 shadow-sm">
                  <Cpu size={14} /> Intelligence
                </div>
                <h3 className="text-2xl lg:text-3xl font-display italic text-text-primary mb-3">Agent Loops</h3>
                <p className="text-muted text-sm leading-relaxed">
                  Deeply weaving Gemini APIs with sophisticated prompt architectures to build autonomous features and self-correcting agents.
                </p>
              </div>

              {/* 3D Three.js Scene */}
              <ThreeDCanvas
                sceneSetup={setupAgentLoops}
                className="absolute inset-0 pointer-events-none"
                style={{ opacity: 0.65 }}
              />
            </div>
          </TiltCard>

          {/* Card 4: Algorithmic Logic */}
          <TiltCard className="md:col-span-8 h-[340px] sm:h-[320px] md:h-[380px] lg:h-[420px]">
            <div className="absolute inset-0 p-6 md:p-12 flex flex-col justify-end overflow-hidden rounded-[2.5rem]" style={{ transformStyle: 'preserve-3d' }}>
              <div style={{ transform: 'translateZ(30px)' }} className="relative z-10 pointer-events-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-muted mb-4 shadow-sm">
                  <Database size={14} /> Logic & Mathematics
                </div>
                <h3 className="text-3xl lg:text-4xl font-display italic text-text-primary mb-3">Algorithmic Base</h3>
                <p className="text-muted text-sm max-w-md leading-relaxed">
                  Computer Science isn't just about syntax. Building low-level custom implementations — like a Power-of-Two Max Heap — ensuring optimal runtime efficiency under heavy loads.
                </p>
              </div>

              {/* 3D Three.js Scene */}
              <ThreeDCanvas
                sceneSetup={setupAlgorithmicBase}
                className="absolute inset-0 pointer-events-none"
                style={{ opacity: 0.65 }}
              />
            </div>
          </TiltCard>

        </div>

        {/* Professional Timeline Segment */}
        <div className="mt-32 md:mt-48 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: "-100px" }}
            className="flex flex-col items-center text-center mb-16 md:mb-24"
          >
            <h3 className="text-3xl md:text-5xl font-display italic text-text-primary">
              The <em>Journey</em>
            </h3>
          </motion.div>

          <div className="relative">
             {/* Central Line for Desktop, Left Line for Mobile */}
             <div className="absolute left-[11px] md:left-1/2 top-0 bottom-0 w-px bg-stroke md:-translate-x-1/2" />

             {/* Timeline Item 1 */}
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.7, delay: 0.1 }}
               viewport={{ once: true, margin: "-100px" }}
               className="relative flex flex-col md:flex-row items-start md:justify-between w-full mb-16 pl-8 md:pl-0"
             >
                <div className="md:w-5/12 text-left md:text-right mb-4 md:mb-0">
                   <h4 className="text-xl md:text-2xl font-bold text-text-primary">2st Place — UniHackathon</h4>
                   <p className="text-muted mt-2 text-sm md:text-base leading-relaxed">
                     Outbuilt university-level teams at age 16. Designed and developed Feynit, an AI-powered educational platform utilizing the Gemini API to dynamically generate personalized learning paths.
                   </p>
                </div>
                <div className="absolute left-[11px] md:left-1/2 md:-translate-x-1/2 w-2 h-2 rounded-full bg-text-primary shadow-[0_0_15px_rgba(255,255,255,0.8)] top-2 md:top-6" />
                <div className="md:w-5/12 text-left mt-1 md:mt-0 md:pt-6">
                   <span className="text-accent-gradient-text font-bold tracking-widest text-sm md:text-lg">2026</span>
                </div>
             </motion.div>

             {/* Timeline Item 2 */}
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.7, delay: 0.2 }}
               viewport={{ once: true, margin: "-100px" }}
               className="relative flex flex-col md:flex-row-reverse items-start md:justify-between w-full mb-16 pl-8 md:pl-0"
             >
                <div className="md:w-5/12 text-left mb-4 md:mb-0">
                   <h4 className="text-xl md:text-2xl font-bold text-text-primary">Full-Stack Freelance</h4>
                   <p className="text-muted mt-2 text-sm md:text-base leading-relaxed">
                     Engineered scalable solutions for local and international clients, including robust automotive dealership platforms, fitness applications, and high-performance landing pages.
                   </p>
                </div>
                <div className="absolute left-[11px] md:left-1/2 md:-translate-x-1/2 w-2 h-2 rounded-full bg-text-primary shadow-[0_0_15px_rgba(255,255,255,0.8)] top-2 md:top-6" />
                <div className="md:w-5/12 text-left md:text-right mt-1 md:mt-0 md:pt-6">
                   <span className="text-accent-gradient-text font-bold tracking-widest text-sm md:text-lg">2025</span>
                </div>
             </motion.div>

             {/* Timeline Item 3 */}
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.7, delay: 0.3 }}
               viewport={{ once: true, margin: "-100px" }}
               className="relative flex flex-col md:flex-row items-start md:justify-between w-full mb-16 pl-8 md:pl-0"
             >
                <div className="md:w-5/12 text-left md:text-right mb-4 md:mb-0">
                   <h4 className="text-xl md:text-2xl font-bold text-text-primary">Cybersecurity Specialization</h4>
                   <p className="text-muted mt-2 text-sm md:text-base leading-relaxed">
                     Completed Harvard's CS50 Cybersecurity track. Heavily focused on network vulnerabilities, penetration testing, cryptography, and secure system architecture.
                   </p>
                </div>
                <div className="absolute left-[11px] md:left-1/2 md:-translate-x-1/2 w-2 h-2 rounded-full bg-text-primary shadow-[0_0_15px_rgba(255,255,255,0.8)] top-2 md:top-6" />
                <div className="md:w-5/12 text-left mt-1 md:mt-0 md:pt-6">
                   <span className="text-accent-gradient-text font-bold tracking-widest text-sm md:text-lg">2024</span>
                </div>
             </motion.div>

             {/* Timeline Item 4 */}
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.7, delay: 0.4 }}
               viewport={{ once: true, margin: "-100px" }}
               className="relative flex flex-col md:flex-row-reverse items-start md:justify-between w-full pl-8 md:pl-0"
             >
                <div className="md:w-5/12 text-left mb-4 md:mb-0">
                   <h4 className="text-xl md:text-2xl font-bold text-text-primary">The Beginning</h4>
                   <p className="text-muted mt-2 text-sm md:text-base leading-relaxed">
                     Wrote my first lines of code. Quickly transitioned from basic Python scripts to mastering React, Node.js, and modern web infrastructure, driven by an insatiable curiosity for how systems work.
                   </p>
                </div>
                <div className="absolute left-[11px] md:left-1/2 md:-translate-x-1/2 w-2 h-2 rounded-full bg-text-primary shadow-[0_0_15px_rgba(255,255,255,0.8)] top-2 md:top-6" />
                <div className="md:w-5/12 text-left md:text-right mt-1 md:mt-0 md:pt-6">
                   <span className="text-accent-gradient-text font-bold tracking-widest text-sm md:text-lg">2023</span>
                </div>
             </motion.div>
          </div>
        </div>

      </div>
    </section>
  );
}
