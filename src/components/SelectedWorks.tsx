import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { cn, Project } from '@/src/lib/utils';

const projects: Project[] = [
  {
    id: "1",
    title: "Feynit — AI Educational App",
    category: "React · Gemini API · AI",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&auto=format&fit=crop&w=1200",
    span: "md:col-span-7"
  },
  {
    id: "2",
    title: "PazarB2B — Industrial Marketplace",
    category: "React Native · Node.js · Supabase",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&auto=format&fit=crop&w=1200",
    span: "md:col-span-5"
  },
  {
    id: "3",
    title: "Mentorly — EdTech Platform",
    category: "React · Node.js · Supabase",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&auto=format&fit=crop&w=1200",
    span: "md:col-span-5"
  },
  {
    id: "4",
    title: "Power-of-Two Max Heap",
    category: "Data Structures · Java",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&auto=format&fit=crop&w=1200",
    span: "md:col-span-7"
  }
];

export default function SelectedWorks() {
  return (
    <section id="work" className="bg-bg py-20 md:py-32">
      <div className="max-w-[1240px] mx-auto px-6 md:px-10 lg:px-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-24 gap-8"
        >
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-px bg-stroke" />
              <span className="text-xs text-muted uppercase tracking-[0.3em]">Selected Work</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display italic text-text-primary mb-6">
              Featured <em>projects</em>
            </h2>
            <p className="text-muted text-lg max-w-sm">
              A selection of projects I've worked on, from concept to launch.
            </p>
          </div>

          <a 
            href="https://github.com/Amertos" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-2 group"
          >
            <span className="text-sm text-text-primary">View all work</span>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-full border border-stroke group-hover:border-transparent transition-colors">
              <div className="absolute inset-0 rounded-full accent-gradient opacity-0 group-hover:opacity-100 transition-opacity" />
              <ArrowRight size={16} className="relative z-10 text-text-primary transition-transform group-hover:translate-x-1" />
            </div>
          </a>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-8">
          {projects.map((project, idx) => (
            <motion.a
              key={project.id}
              href="https://github.com/Amertos"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true, margin: "-100px" }}
              className={cn(
                "group relative overflow-hidden rounded-[2.5rem] bg-surface aspect-[4/5] md:aspect-auto md:h-[400px] lg:h-[500px] border border-stroke block",
                project.span
              )}
            >
              {/* Image */}
              <img 
                src={project.image} 
                alt={project.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              
              {/* Halftone Overlay */}
              <div className="absolute inset-0 halftone opacity-20 mix-blend-overlay pointer-events-none" />

              {/* Hover Content */}
              <div className="absolute inset-0 bg-bg/60 opacity-0 group-hover:opacity-100 backdrop-blur-md transition-all duration-500 flex items-center justify-center md:flex hidden">
                 <div className="relative overflow-hidden rounded-full p-[1px] accent-gradient translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="bg-white px-6 py-2 rounded-full">
                       <span className="text-black text-sm font-medium flex items-center gap-2">
                          View on GitHub <ArrowRight size={14} />
                       </span>
                    </div>
                 </div>
              </div>

              {/* Static Label */}
              <div className="absolute bottom-0 left-0 right-0 p-8 z-10 bg-gradient-to-t from-bg/90 to-transparent md:group-hover:opacity-0 transition-opacity">
                <p className="text-xs text-white/80 mb-1">{project.category}</p>
                <h3 className="text-xl text-white font-medium drop-shadow-md">{project.title}</h3>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
