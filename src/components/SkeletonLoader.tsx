/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'card' | 'stats' | 'table';
}

export default function SkeletonLoader({ className = '', variant = 'text' }: SkeletonProps) {
  if (variant === 'stats') {
    return (
      <div className={`p-6 rounded-2xl bg-imsec-card border border-imsec-border overflow-hidden shimmer-bg-parent ${className}`}>
        <div className="h-4 w-24 bg-white/5 rounded shimmer-bg mb-3" />
        <div className="h-8 w-16 bg-white/10 rounded shimmer-bg" />
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`p-6 rounded-2xl bg-imsec-card border border-imsec-border space-y-4 overflow-hidden ${className}`}>
        <div className="flex justify-between items-start">
          <div className="h-6 w-32 bg-white/10 rounded shimmer-bg" />
          <div className="h-5 w-16 bg-white/5 rounded-full shimmer-bg" />
        </div>
        <div className="h-4 w-3/4 bg-white/5 rounded shimmer-bg" />
        <div className="space-y-2">
          <div className="h-3 w-full bg-white/5 rounded shimmer-bg" />
          <div className="h-3 w-5/6 bg-white/5 rounded shimmer-bg" />
        </div>
        <div className="pt-2 flex justify-between items-center border-t border-white/5">
          <div className="h-4 w-20 bg-white/5 rounded shimmer-bg" />
          <div className="h-4 w-24 bg-white/5 rounded shimmer-bg" />
        </div>
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="h-10 w-full bg-white/10 rounded shimmer-bg" />
        <div className="h-12 w-full bg-white/5 rounded shimmer-bg" />
        <div className="h-12 w-full bg-white/5 rounded shimmer-bg" />
        <div className="h-12 w-full bg-white/5 rounded shimmer-bg" />
        <div className="h-12 w-full bg-white/5 rounded shimmer-bg" />
      </div>
    );
  }

  return (
    <div className={`h-4 w-full bg-white/5 rounded shimmer-bg ${className}`} />
  );
}
