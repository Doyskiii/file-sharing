'use client';

import { useSession } from '@/hooks/use-session';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { FolderIcon, FileIcon, ShareIcon, ActivityIcon, UploadIcon, PlusIcon } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

export default function DashboardPage() {
  const { user, loading, logout } = useSession();
  const [stats, setStats] = useState([
    { title: 'Total Files', value: '0', icon: FileIcon, href: '/files/all-files' },
    { title: 'Total Folders', value: '0', icon: FolderIcon, href: '/files/all-folders' },
    { title: 'Shared Files', value: '0', icon: ShareIcon, href: '/files/shared/with-me' },
    { title: 'Activities', value: '0', icon: ActivityIcon, href: '/activity/all-activities' },
  ]);

  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    if (user) {
      fetchStats();
      fetchRecentActivities();
    }
  }, [user]);

  // Real-time updates for recent activities
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetchRecentActivities();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [user]);

  const fetchStats = async () => {
    try {
      // Fetch total files
      const filesResponse = await api.get('/files');
      const totalFiles = filesResponse.data.data.length;

      // Fetch total folders
      const foldersResponse = await api.get('/folders');
      const totalFolders = foldersResponse.data.data.length;

      // Fetch shared files
      const sharedResponse = await api.get('/shares/received');
      const totalShared = sharedResponse.data.data.length;

      // For activities, fetch with limit 1 to get count if available, else show N/A
      let totalActivities = 'N/A';
      try {
        const activitiesResponse = await api.get('/activities/me?page=1&limit=1');
        // If meta has total, use it, else N/A
        if (activitiesResponse.data.meta && activitiesResponse.data.meta.total) {
          totalActivities = activitiesResponse.data.meta.total.toString();
        }
      } catch (error) {
        // Keep N/A
      }

      setStats([
        { title: 'Total Files', value: totalFiles.toString(), icon: FileIcon, href: '/files/all-files' },
        { title: 'Total Folders', value: totalFolders.toString(), icon: FolderIcon, href: '/files/all-folders' },
        { title: 'Shared Files', value: totalShared.toString(), icon: ShareIcon, href: '/files/shared/with-me' },
        { title: 'Activities', value: totalActivities, icon: ActivityIcon, href: '/activity/all-activities' },
      ]);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const response = await api.get('/activities/me?page=1&limit=5');
      setRecentActivities(response.data.data);
    } catch (error) {
      console.error('Failed to fetch recent activities:', error);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!user) {
    return null; // useSession will handle redirect
  }

  const quickActions = [
    { title: 'Upload File', icon: UploadIcon, href: '/files/all-files' }, // Link to files page since no upload page
    { title: 'Create Folder', icon: PlusIcon, href: '/files/all-folders' },
  ];

  const getActivityDescription = (activity) => {
    const actionMap = {
      'file:upload': 'Uploaded file',
      'file:download': 'Downloaded file',
      'file:update': 'Updated file',
      'file:delete': 'Deleted file',
      'file:view': 'Viewed file',
      'folder:create': 'Created folder',
      'folder:update': 'Updated folder',
      'folder:delete': 'Deleted folder',
      'folder:view': 'Viewed folder',
      'share:create': 'Shared file',
      'share:access': 'Accessed shared file',
      'auth:login': 'Logged in',
      'auth:logout': 'Logged out',
      // Add more as needed
    };

    const base = actionMap[activity.action] || activity.action;

    if (activity.file) {
      return `${base} "${activity.file.name}"`;
    } else if (activity.folder) {
      return `${base} "${activity.folder.name}"`;
    }

    return base;
  };

  const formatRelativeTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

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

      {/* Recent Activity */}
      <Card className="bg-zinc-900/50 border-zinc-700/50">
        <CardHeader>
          <CardTitle className="text-white">Recent Activity</CardTitle>
          <CardDescription className="text-zinc-400">
            Your latest file operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivities.length > 0 ? (
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm text-zinc-300">{getActivityDescription(activity)}</p>
                    <p className="text-xs text-zinc-500">{formatRelativeTime(activity.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-500">No recent activity</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
