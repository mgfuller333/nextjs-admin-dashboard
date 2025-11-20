// components/Charts/payments-overview/skeleton.tsx
"use client";

import { Skeleton, Box } from '@mui/material';
import { cn } from "@/lib/utils";

export function PaymentsOverviewSkeleton() {
  return (
    <div className={cn(
      "w-[600px] h-[1000px] rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card"
    )}>
      {/* Header with dropdowns */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Skeleton variant="text" width={180} height={40} className="dark:bg-gray-700" />

        <div className="flex gap-3">
          <Skeleton variant="rounded" width={120} height={36} className="rounded-md dark:bg-gray-700" />
          <Skeleton variant="rounded" width={140} height={36} className="rounded-md dark:bg-gray-700" />
        </div>
      </div>

      {/* Chart area with animated waves */}
      <div className="relative -ml-4 -mr-5 h-[310px] overflow-hidden rounded-lg bg-gray-50 dark:bg-gray-800">
        <div className="absolute inset-0 animate-pulse">
          <svg className="h-full w-full" viewBox="0 0 800 310" preserveAspectRatio="none">
            {/* Wave 1 */}
            <path
              d="M0,150 Q200,80 400,120 T800,150 L800,310 L0,310 Z"
              fill="url(#grad1)"
              opacity="0.4"
            />
            {/* Wave 2 */}
            <path
              d="M0,180 Q200,100 400,160 T800,180 L800,310 L0,310 Z"
              fill="url(#grad2)"
              opacity="0.3"
            />
            {/* Wave 3 */}
            <path
              d="M0,220 Q200,180 400,200 T800,220 L800,310 L0,310 Z"
              fill="url(#grad3)"
              opacity="0.2"
            />
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#5750F1" />
                <stop offset="100%" stopColor="#0ABEF9" />
              </linearGradient>
              <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
              <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#EF4444" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Fake legend */}
        <div className="absolute top-4 left-6 flex flex-wrap gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={cn("size-3 rounded-full", [
                "bg-[#5750F1]",
                "bg-[#0ABEF9]",
                "bg-[#F59E0B]"
              ][i])} />
              <Skeleton variant="text" width={60} height={20} className="dark:bg-gray-700" />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom stats */}
      <dl className="flex flex-wrap justify-center gap-x-8 gap-y-4 pb-3 text-center">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex flex-col items-center px-2">
            <Skeleton variant="text" width={60} height={36} className="dark:bg-gray-700" />
            <Skeleton variant="text" width={80} height={20} className="mt-1 dark:bg-gray-700" />
          </div>
        ))}
      </dl>
    </div>
  );
}