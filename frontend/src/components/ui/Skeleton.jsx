// frontend/src/components/ui/Skeleton.jsx
import React from 'react';

const Skeleton = ({ className, ...props }) => {
    return (
        <div
            className={`animate-pulse rounded-md bg-gray-200 dark:bg-gray-700 ${className}`}
            {...props}
        />
    );
};

export const CardSkeleton = () => (
    <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <Skeleton className="h-4 w-1/2 mb-4" />
        <Skeleton className="h-10 w-full mb-2" />
        <Skeleton className="h-3 w-1/4" />
    </div>
);

export default Skeleton;
