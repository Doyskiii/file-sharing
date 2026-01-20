'use client';

import { useSession } from '@/hooks/use-session';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { FolderIcon, FileIcon, ShareIcon, ActivityIcon, UploadIcon, PlusIcon } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, loading, logout } = useSession();

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!user) {
    return null; // useSession will handle redirect
  }

  const stats = [
    { title: 'Total Files', value: '0', icon: FileIcon, href: '/files/all-files' },
    { title: 'Total Folders', value: '0', icon: FolderIcon, href: '/files/all-folders' },
    { title: 'Shared Files', value: '0', icon: ShareIcon, href: '/files/shared/with-me' },
    { title: 'Activities', value: '0', icon: ActivityIcon, href: '/activity/all-activities' },
  ];

  const quickActions = [
    { title: 'Upload File', icon: UploadIcon, href: '/files/all-files' }, // Link to files page since no upload page
    { title: 'Create Folder', icon: PlusIcon, href: '/files/all-folders' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Welcome back, {user.username}!
          </h1>
          <p className="text-zinc-400 mt-1">
            Role: {user.roles?.map(r => r.name).join(', ')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
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

      {/* Quick Actions */}
      <Card className="bg-zinc-900/50 border-zinc-700/50">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
          <CardDescription className="text-zinc-400">
            Common tasks to get you started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {quickActions.map((action) => (
              <Link key={action.title} href={action.href}>
                <Button variant="outline" className="flex items-center gap-2">
                  <action.icon className="h-4 w-4" />
                  {action.title}
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Placeholder */}
      <Card className="bg-zinc-900/50 border-zinc-700/50">
        <CardHeader>
          <CardTitle className="text-white">Recent Activity</CardTitle>
          <CardDescription className="text-zinc-400">
            Your latest file operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-zinc-500">No recent activity</p>
        </CardContent>
      </Card>
    </div>
  );
}