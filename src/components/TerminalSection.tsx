import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal as TerminalIcon } from 'lucide-react';

interface Command {
  cmd: string;
  output: React.ReactNode;
  id: string;
}

const HISTORY_LIMIT = 20;

// Typewriter component for realistic terminal feeling
const TypewriterText = ({ text, delay = 10 }: { text: string; delay?: number }) => {
  const [content, setContent] = useState('');

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setContent(text.substring(0, i));
      i++;
      if (i > text.length) clearInterval(timer);
    }, delay);
    return () => clearInterval(timer);
  }, [text, delay]);

  return <span>{content}</span>;
};

export default function TerminalSection() {
  const [input, setInput] = useState('');
  const [isMatrix, setIsMatrix] = useState(false);
  const [history, setHistory] = useState<Command[]>([
    {
      id: 'init-1',
      cmd: 'whoami',
      output: (
        <div className="text-muted">
          <span className="text-text-primary"><TypewriterText text="Amer Biberovic" /></span>
          <br />
          Role: <TypewriterText text="Full-Stack Engineer / AI Builder / Cybersecurity Learner" delay={5} />
          <br />
          Age: <TypewriterText text="16" />
          <br />
          Location: <TypewriterText text="Novi Pazar, Serbia" />
        </div>
      )
    }
  ]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [history, input]);

  // Matrix Effect Hook
  useEffect(() => {
    if (!isMatrix) return;
    const interval = setInterval(() => {
      setHistory(prev => [...prev.slice(-HISTORY_LIMIT), { 
        id: Math.random().toString(), 
        cmd: '', 
        output: <span className="text-green-500 font-bold opacity-80 text-xs break-all">{Array.from({length: 40}, () => String.fromCharCode(33 + Math.random() * 94)).join('')}</span>
      }]);
    }, 100);
    return () => clearInterval(interval);
  }, [isMatrix]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmdStr = input.trim();
    if (!cmdStr) return;
    
    const args = cmdStr.split(' ');
    const cmd = args[0].toLowerCase();
    const cmdId = Math.random().toString();

    if (isMatrix && cmd !== 'clear') {
       setIsMatrix(false);
    }

    let output: React.ReactNode = '';

    switch (cmd) {
      case 'help':
        output = (
          <div className="text-muted">
            <TypewriterText text="Available commands:" delay={5} />
            <br />
            <span className="text-accent-gradient-text font-bold">whoami</span> - Display user info
            <br />
            <span className="text-accent-gradient-text font-bold">skills</span> - List technical skills
            <br />
            <span className="text-accent-gradient-text font-bold">hackathon</span> - View hackathon achievements
            <br />
            <span className="text-accent-gradient-text font-bold">projects</span> - View my selected works
            <br />
            <span className="text-accent-gradient-text font-bold">socials</span> - Links to my profiles
            <br />
            <span className="text-accent-gradient-text font-bold">neofetch</span> - Display system information
            <br />
            <span className="text-accent-gradient-text font-bold">matrix</span> - Enter the matrix
            <br />
            <span className="text-accent-gradient-text font-bold">date</span> - Display current system date
            <br />
            <span className="text-accent-gradient-text font-bold">echo</span> - Print arguments
            <br />
            <span className="text-accent-gradient-text font-bold">sudo</span> - Execute a command as superuser
            <br />
            <span className="text-accent-gradient-text font-bold">clear</span> - Clear terminal
          </div>
        );
        break;
      case 'whoami':
        output = (
          <div className="text-muted">
            <span className="text-text-primary"><TypewriterText text="Amer Biberovic" /></span>
            <br />
            Role: <TypewriterText text="Full-Stack Engineer / AI Builder / Cybersecurity Learner" delay={5} />
            <br />
            Age: <TypewriterText text="16" />
            <br />
            Location: <TypewriterText text="Novi Pazar, Serbia" />
          </div>
        );
        break;
      case 'skills':
        output = (
          <div className="text-muted">
            <TypewriterText text="[Frontend] React, Next.js, Tailwind CSS, TypeScript" delay={5} />
            <br />
            <TypewriterText text="[Backend] Node.js, Supabase, PostgreSQL, Firebase" delay={5} />
            <br />
            <TypewriterText text="[AI] Gemini API, Prompt Engineering" delay={5} />
            <br />
            <TypewriterText text="[Security] CS50 Cybersecurity, TryHackMe" delay={5} />
          </div>
        );
        break;
      case 'hackathon':
         output = (
          <div className="text-muted">
            <span className="text-text-primary font-medium"><TypewriterText text="1st Place — UniHackathon 2026" /></span>
            <br />
            <TypewriterText text="Outbuilt every university-level team at age 16. Designed and built Feynit, an AI-powered educational app using the Gemini API." delay={2} />
          </div>
         );
         break;
      case 'projects':
         output = (
          <div className="text-muted">
            - <span className="text-text-primary font-medium">Feynit</span> (AI Educational Platform)
            <br />
            - <span className="text-text-primary font-medium">Pazar B2B</span> (Mobile APP for local businesses)
            <br />
            - <span className="text-text-primary font-medium">FitCoach</span> (AI Workout Generator)
            <br />
            - <span className="text-text-primary font-medium">Cyber Labs</span> (Security write-ups and tools)
          </div>
         );
         break;
      case 'socials':
         output = (
          <div className="text-muted flex flex-col gap-1">
            <a href="https://github.com/Amertos" target="_blank" rel="noopener noreferrer" className="text-accent-gradient-text hover:underline">- GitHub</a>
            <a href="https://www.linkedin.com/in/amer-biberovic-78099237b/" target="_blank" rel="noopener noreferrer" className="text-accent-gradient-text hover:underline">- LinkedIn</a>
          </div>
         );
         break;
      case 'date':
         output = <div className="text-muted"><TypewriterText text={new Date().toString()} /></div>;
         break;
      case 'echo':
         output = <div className="text-muted"><TypewriterText text={args.slice(1).join(' ')} /></div>;
         break;
      case 'sudo':
         if (args[1] === 'rm' && args[2] === '-rf' && args[3] === '/') {
            output = <div className="text-red-500 font-bold animate-pulse"><TypewriterText text="CRITICAL ERROR: Root access denied. Nice try." delay={10} /></div>;
         } else {
            output = <div className="text-red-400"><TypewriterText text="amer is not in the sudoers file. This incident will be reported." /></div>;
         }
         break;
      case 'neofetch':
         output = (
           <div className="flex gap-4 text-xs md:text-sm text-muted">
             <pre className="text-accent-gradient-text font-bold leading-[1.1]">
{`       .         
      / \\        
     /   \\       
    /     \\      
   /_______\\     
  /         \\    
 /           \\   
/             \\  `}
             </pre>
             <div className="flex flex-col justify-center">
               <span className="text-text-primary font-bold">amer@ameros</span>
               <span>----------------</span>
               <span><span className="text-accent-gradient-text font-bold">OS:</span> WebOS 2.0</span>
               <span><span className="text-accent-gradient-text font-bold">Kernel:</span> React 18.x</span>
               <span><span className="text-accent-gradient-text font-bold">Uptime:</span> Just started</span>
               <span><span className="text-accent-gradient-text font-bold">Shell:</span> bash</span>
               <span><span className="text-accent-gradient-text font-bold">Resolution:</span> Responsive</span>
               <span><span className="text-accent-gradient-text font-bold">Memory:</span> 16GB Human Brain</span>
             </div>
           </div>
         );
         break;
      case 'matrix':
         setIsMatrix(true);
         output = <div className="text-green-500"><TypewriterText text="Entering the matrix..." /></div>;
         break;
      case 'clear':
        setIsMatrix(false);
        setHistory([]);
        setInput('');
        return;
      default:
        output = <div className="text-red-400"><TypewriterText text={`Command not found: ${cmd}. Type 'help' for available commands.`} /></div>;
    }

    setHistory(prev => [...prev.slice(-HISTORY_LIMIT), { id: cmdId, cmd: cmdStr, output }]);
    setInput('');
  };

  return (
    <section id="terminal" className="bg-bg py-24 md:py-40">
      <div className="max-w-[1000px] mx-auto px-6 md:px-16">
         <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col items-center text-center mb-16"
        >
          <div className="text-xs text-muted uppercase tracking-[0.3em] mb-6">Interactive</div>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-display italic text-text-primary mb-6">
            Command <em>center</em>
          </h2>
          <p className="text-muted md:text-lg max-w-md">
            Explore my cybersecurity background and skills directly from the terminal.
          </p>
        </motion.div>

        <motion.div
           initial={{ opacity: 0, scale: 0.9, y: 50 }}
           whileInView={{ opacity: 1, scale: 1, y: 0 }}
           transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
           viewport={{ once: true, margin: "-100px" }}
           className="rounded-2xl border border-stroke bg-surface overflow-hidden shadow-2xl flex flex-col h-[400px] md:h-[500px]"
           onClick={() => inputRef.current?.focus()}
        >
          {/* Terminal Header */}
          <div className="flex items-center px-4 py-3 border-b border-stroke bg-bg/50">
            <div className="flex gap-2 mr-4">
              <div className="w-3 h-3 rounded-full bg-red-500/80 cursor-pointer hover:bg-red-500 transition-colors" onClick={() => setHistory([])} />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80 cursor-pointer hover:bg-yellow-500 transition-colors" />
              <div className="w-3 h-3 rounded-full bg-green-500/80 cursor-pointer hover:bg-green-500 transition-colors" onClick={() => inputRef.current?.focus()} />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted font-mono justify-center flex-1 pr-12">
              <TerminalIcon size={14} />
              amer@localhost:~
            </div>
          </div>

          {/* Terminal Body */}
          <div ref={containerRef} className="flex-1 p-4 md:p-6 overflow-y-auto font-mono text-sm md:text-base flex flex-col gap-4 scroll-smooth">
            <div className="text-muted mb-4">
               <TypewriterText text="Welcome to AmerOS v1.0.0." delay={20} />
               <br />
               <TypewriterText text="Type 'help' to see available commands." delay={10} />
            </div>

            <AnimatePresence initial={false}>
              {history.map((item) => (
                <motion.div 
                  key={item.id} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-col gap-2"
                >
                  {item.cmd && (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-green-400">amer@localhost</span>
                      <span className="text-muted">:~$</span>
                      <span className="text-text-primary break-all">{item.cmd}</span>
                    </div>
                  )}
                  <div className="overflow-x-auto pb-1">{item.output}</div>
                </motion.div>
              ))}
            </AnimatePresence>

            <form onSubmit={handleCommand} className="flex flex-wrap items-center gap-2 mt-2">
               <span className="text-green-400">amer@localhost</span>
               <span className="text-muted">:~$</span>
               <input
                 ref={inputRef}
                 type="text"
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 className="flex-1 min-w-[100px] bg-transparent border-none outline-none text-text-primary placeholder:text-muted/30"
                 autoComplete="off"
                 spellCheck="false"
                 autoFocus
               />
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
