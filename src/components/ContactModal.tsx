import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('https://formsubmit.co/ajax/amerbiberovic12@gmail.com', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
          _subject: `New Portfolio Message from ${formData.name}`,
          _template: 'box'
        })
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', message: '' });
        setTimeout(() => {
          setStatus('idle');
          onClose();
        }, 2000);
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Contact error:', error);
      setStatus('error');
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
    >
      <div 
        className="absolute inset-0 bg-bg/80 backdrop-blur-xl" 
        onClick={onClose} 
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-xl bg-surface border border-stroke rounded-[2.5rem] overflow-hidden shadow-2xl p-8 md:p-12"
      >
        <button 
          onClick={onClose}
          data-cursor="CLOSE"
          className="absolute top-8 right-8 w-10 h-10 rounded-full border border-stroke flex items-center justify-center hover:bg-stroke transition-colors text-muted hover:text-text-primary"
        >
          <X size={18} />
        </button>

        <div className="mb-10">
          <h2 className="text-4xl font-display italic text-text-primary leading-none mb-4">
            Say <em>hi</em>
          </h2>
          <p className="text-muted text-sm">
            Have a project in mind or just want to chat? Drop me a message below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-[10px] uppercase tracking-[0.2em] text-muted ml-1">Full Name</label>
            <input
              required
              id="name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-bg border border-stroke rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-[10px] uppercase tracking-[0.2em] text-muted ml-1">Email Address</label>
            <input
              required
              id="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-bg border border-stroke rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="text-[10px] uppercase tracking-[0.2em] text-muted ml-1">Message</label>
            <textarea
              required
              id="message"
              rows={4}
              placeholder="How can I help you?"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full bg-bg border border-stroke rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-white/20 transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            data-cursor="SEND IT"
            className={cn(
              "group relative w-full rounded-full overflow-hidden p-[1px] transition-transform active:scale-[0.98]",
              status === 'loading' ? "cursor-wait" : ""
            )}
          >
            <div className={cn(
              "absolute inset-0 accent-gradient opacity-100 transition-opacity",
              status === 'loading' ? "animate-gradient-shift" : ""
            )} />
            <div className="relative bg-surface rounded-full py-4 flex items-center justify-center gap-2 text-text-primary font-medium hover:bg-bg/80 transition-colors">
              {status === 'loading' ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Sending...
                </>
              ) : status === 'success' ? (
                <>
                  <CheckCircle2 size={18} className="text-green-500" />
                  Sent Successfully!
                </>
              ) : status === 'error' ? (
                "Error - Try again"
              ) : (
                <>
                  Send Message
                  <Send size={16} className="text-muted group-hover:text-text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                </>
              )}
            </div>
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-[10px] text-muted/50 uppercase tracking-[0.2em]">
            I usually respond within 24 hours.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
