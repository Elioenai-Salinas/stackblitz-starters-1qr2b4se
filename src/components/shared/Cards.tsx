import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color?: 'pink' | 'blue' | 'green' | 'yellow' | 'lavender';
}

const colorClasses = {
  pink: 'bg-pastel-pink',
  blue: 'bg-pastel-blue',
  green: 'bg-pastel-green',
  yellow: 'bg-pastel-yellow',
  lavender: 'bg-pastel-lavender',
};

const iconColorClasses = {
  pink: 'text-accent-foreground',
  blue: 'text-secondary-foreground',
  green: 'text-green-700',
  yellow: 'text-amber-700',
  lavender: 'text-purple-700',
};

export function FeatureCard({ icon: Icon, title, description, color = 'blue' }: FeatureCardProps) {
  return (
    <motion.div
      className="group bg-card rounded-2xl p-6 shadow-soft card-hover border border-border/50"
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className={`inline-flex p-3 rounded-xl ${colorClasses[color]} mb-4`}>
        <Icon className={`h-6 w-6 ${iconColorClasses[color]}`} />
      </div>
      <h3 className="font-heading font-bold text-lg text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
}

interface ProgramCardProps {
  image: string;
  title: string;
  subtitle: string;
  description: string;
  href: string;
  color?: 'pink' | 'blue' | 'green' | 'yellow';
}

export function ProgramCard({ image, title, subtitle, description, href, color = 'blue' }: ProgramCardProps) {
  return (
    <motion.a
      href={href}
      className="group block bg-card rounded-2xl overflow-hidden shadow-card card-hover"
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 ${colorClasses[color]} ${iconColorClasses[color]}`}>
            {subtitle}
          </span>
          <h3 className="font-heading font-bold text-xl text-white">{title}</h3>
        </div>
      </div>
      <div className="p-5">
        <p className="text-muted-foreground text-sm leading-relaxed mb-4">{description}</p>
        <span className="inline-flex items-center text-primary font-semibold text-sm group-hover:gap-2 transition-all">
          Conocer más 
          <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </span>
      </div>
    </motion.a>
  );
}

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  avatar?: string;
}

export function TestimonialCard({ quote, author, role, avatar }: TestimonialCardProps) {
  return (
    <motion.div
      className="bg-card rounded-2xl p-6 shadow-soft border border-border/50"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <div className="flex gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg key={star} className="w-5 h-5 text-golden" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <p className="text-foreground italic mb-4 leading-relaxed">"{quote}"</p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary font-bold">
          {author.charAt(0)}
        </div>
        <div>
          <p className="font-semibold text-foreground text-sm">{author}</p>
          <p className="text-muted-foreground text-xs">{role}</p>
        </div>
      </div>
    </motion.div>
  );
}

interface StatCardProps {
  value: string;
  label: string;
  icon?: LucideIcon;
}

export function StatCard({ value, label, icon: Icon }: StatCardProps) {
  return (
    <motion.div
      className="text-center p-6"
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
    >
      {Icon && (
        <div className="inline-flex p-3 rounded-full bg-secondary mb-3">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      )}
      <p className="font-heading font-bold text-4xl text-primary mb-1">{value}</p>
      <p className="text-muted-foreground text-sm">{label}</p>
    </motion.div>
  );
}
