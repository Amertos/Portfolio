import { motion } from 'motion/react';

const stats = [
  { label: "Intensive Coding", value: "1+ YR" },
  { label: "Complex Projects", value: "10+" },
  { label: "Verified Certs", value: "12+" }
];

export default function Stats() {
  return (
    <section className="bg-bg py-24 md:py-40">
      <div className="max-w-[1240px] mx-auto px-6 md:px-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1, delay: idx * 0.15, type: "spring", stiffness: 100 }}
              viewport={{ once: true, margin: "-100px" }}
              className="flex flex-col items-center text-center"
            >
              <h3 className="text-6xl md:text-8xl font-display italic text-text-primary mb-4 leading-none tracking-tighter">
                {stat.value}
              </h3>
              <p className="text-xs text-muted uppercase tracking-[0.3em]">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
