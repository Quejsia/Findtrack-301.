import React from 'react';
import { Item } from '../types';
import { motion } from 'motion/react';
import { 
  Laptop, 
  Key, 
  Wallet, 
  FileText, 
  Shirt, 
  Gem, 
  Briefcase, 
  HelpCircle, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';

interface ItemCardProps {
  key?: React.Key;
  item: Item;
  onSelect: (item: Item) => void;
}

// Map categories to modern, clean Lucide icons
export const getCategoryIcon = (category: string, className = "h-5 w-5") => {
  switch (category) {
    case 'electronics':
      return <Laptop className={className} />;
    case 'keys':
      return <Key className={className} />;
    case 'wallet':
      return <Wallet className={className} />;
    case 'documents':
      return <FileText className={className} />;
    case 'clothing':
      return <Shirt className={className} />;
    case 'jewelry':
      return <Gem className={className} />;
    case 'bags':
      return <Briefcase className={className} />;
    default:
      return <HelpCircle className={className} />;
  }
};

export default function ItemCard({ item, onSelect }: ItemCardProps) {
  const isLost = item.type === 'lost';
  const isResolved = item.status === 'resolved';

  const formattedDate = new Date(item.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <motion.div
      layoutId={`card-container-${item.id}`}
      onClick={() => onSelect(item)}
      className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-md  cursor-pointer"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      id={`item-card-${item.id}`}
    >
      {/* Type Badges */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span 
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold leading-relaxed tracking-wide uppercase ${
            isLost 
              ? 'bg-error-container/20 text-error border border-error/30' 
              : 'bg-primary-container/20 text-primary-dim border border-primary/30'
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${isLost ? 'bg-error' : 'bg-primary'}`} />
          {item.type}
        </span>

        <span className="font-mono text-[9px] text-on-surface-variant/70 font-semibold tracking-wider uppercase">
          {item.category}
        </span>
      </div>

      {/* Hero Display or Icon Placeholder */}
      <div className="flex items-start gap-3 mb-4">
        {item.imageUrl ? (
          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-low">
            <img 
              src={item.imageUrl} 
              alt={item.title} 
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
          </div>
        ) : (
          <div className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl border ${
            isLost 
              ? 'bg-error-container/10 border-error/30 text-error' 
              : 'bg-primary-container/10 border-emerald-100 text-primary'
          }`}>
            {getCategoryIcon(item.category, "h-7 w-7")}
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-sans text-sm font-semibold text-on-surface group-hover:text-primary transition-colors line-clamp-1">
            {item.title}
          </h3>
          <p className="font-sans text-xs text-on-surface-variant line-clamp-2 mt-1 leading-relaxed">
            {item.description}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-outline-variant/30 my-2.5"></div>

      {/* Details Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 mt-1 font-sans text-[11px] text-on-surface-variant">
        <div className="flex items-center space-x-1 min-w-0 max-w-36">
          <MapPin className="h-3.5 w-3.5 text-on-surface-variant/70 shrink-0" />
          <span className="truncate">{item.location}</span>
        </div>

        <div className="flex items-center space-x-1 shrink-0">
          <Calendar className="h-3.5 w-3.5 text-on-surface-variant/70" />
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* Resolution Indicator Pill overlay */}
      {isResolved && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface-container-lowest/70 backdrop-blur-[1px] transition-opacity">
          <span className="inline-flex items-center gap-1 rounded-full bg-on-surface px-3 py-1 text-xs font-bold font-sans text-white shadow-lg">
            <CheckCircle2 className="h-4 w-4 text-primary-container" />
            <span>Resolved</span>
          </span>
        </div>
      )}
    </motion.div>
  );
}
