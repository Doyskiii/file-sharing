'use client';

import { ChevronRightIcon, HomeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BreadcrumbItem {
  id: number;
  name: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onNavigate?: (folderId: number | null) => void;
  className?: string;
}

export function Breadcrumb({ items, onNavigate, className = '' }: BreadcrumbProps) {
  if (items.length === 0) {
    return (
      <div className={`flex items-center gap-1 text-sm text-zinc-400 ${className}`}>
        <HomeIcon className="h-4 w-4" />
        <span>Home</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 text-sm ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onNavigate?.(null)}
        className="h-6 px-2 text-zinc-400 hover:text-zinc-300"
      >
        <HomeIcon className="h-4 w-4 mr-1" />
        Home
      </Button>

      {items.map((item, index) => (
        <div key={item.id} className="flex items-center gap-1">
          <ChevronRightIcon className="h-4 w-4 text-zinc-500" />
          {index === items.length - 1 ? (
            <span className="text-zinc-300 font-medium">{item.name}</span>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate?.(item.id)}
              className="h-6 px-2 text-zinc-400 hover:text-zinc-300"
            >
              {item.name}
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
