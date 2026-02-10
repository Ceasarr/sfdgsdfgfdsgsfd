'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';

function SkeletonCard() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Order number skeleton */}
            <div className="h-6 w-28 bg-muted rounded animate-pulse" />
            {/* Status badge skeleton */}
            <div className="h-5 w-20 bg-muted rounded-full animate-pulse" />
          </div>
          {/* Date skeleton */}
          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Roblox username skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-muted rounded animate-pulse" />
          <div className="h-4 w-32 bg-muted rounded animate-pulse" />
        </div>

        {/* Items preview skeleton */}
        <div className="flex gap-2">
          <div className="h-12 w-12 bg-muted rounded animate-pulse" />
          <div className="h-12 w-12 bg-muted rounded animate-pulse" />
          <div className="h-12 w-12 bg-muted rounded animate-pulse" />
        </div>

        {/* Bottom row: total and actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="h-6 w-24 bg-muted rounded animate-pulse" />
          <div className="flex gap-2">
            <div className="h-9 w-28 bg-muted rounded animate-pulse" />
            <div className="h-9 w-9 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function OrdersSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
