'use client';

import { useSession } from '@/hooks/use-session';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderIcon, FileIcon, ShareIcon, ActivityIcon } from 'lucide-react';
import Link from 'next/link';

export function StatsGrid() {
  const { user } = useSession();

  // Placeholder stats - in real app, fetch from API
  const stats = [
    { title: 'Total Files', value: '0', icon: FileIcon, href: '/files/all-files' },
    { title: 'Total Folders', value: '0', icon: FolderIcon, href: '/files/all-folders' },
    { title: 'Shared Files', value: '0', icon: ShareIcon, href: '/files/shared/with-me' },
    { title: 'Activities', value: '0', icon: ActivityIcon, href: '/activity/all-activities' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="bg-zinc-900/50 border-zinc-700/50 hover:bg-zinc-800/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <Link href={stat.href}>
              <Button variant="link" className="p-0 h-auto text-zinc-400 hover:text-white">
                View details →
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}