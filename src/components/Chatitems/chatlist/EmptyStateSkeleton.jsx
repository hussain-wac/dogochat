import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
const EmptyStateSkeleton = () => (
    <div className="divide-y dark:divide-neutral-800">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="p-3 flex items-center space-x-3">
          <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-10" />
            </div>
            <Skeleton className="h-3 w-36" />
          </div>
          <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
        </div>
      ))}
    </div>
  );
  

  export default EmptyStateSkeleton;