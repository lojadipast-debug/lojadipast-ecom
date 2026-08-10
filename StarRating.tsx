import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  count?: number;
  size?: number;
  className?: string;
}

export function StarRating({ rating, count, size = 14, className = '' }: StarRatingProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i + 1 <= Math.round(rating);
          return (
            <Star
              key={i}
              size={size}
              className={filled ? 'fill-cream-400 text-cream-400' : 'fill-ink-100 text-ink-200'}
              strokeWidth={1.5}
            />
          );
        })}
      </span>
      {count !== undefined && (
        <span className="text-xs font-medium text-ink-500">
          {rating.toFixed(1)} ({count})
        </span>
      )}
    </span>
  );
}
