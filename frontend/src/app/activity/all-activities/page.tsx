'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/hooks/use-session';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ActivityIcon,
  SearchIcon,
  FilterIcon,
  UserIcon,
  FileIcon,
  FolderIcon,
  ShareIcon,
  CalendarIcon
} from 'lucide-react';
import { toast } from 'sonner';

interface Activity {
  id: number;
  action: string;
  entityType: string;
  entityId: number;
  details: any;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
}

export default function AllActivitiesPage() {
  const { user } = useSession();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchActivities();
  }, [searchTerm, actionFilter, entityFilter, currentPage]);

  // Polling for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Only poll if no search term and no filters, to avoid interrupting user interaction
      if (!searchTerm && actionFilter === 'all' && entityFilter === 'all' && currentPage === 1) {
        fetchActivities();
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [searchTerm, actionFilter, entityFilter, currentPage]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
      });

      if (searchTerm) params.append('search', searchTerm);
      if (actionFilter !== 'all') params.append('action', actionFilter);
      if (entityFilter !== 'all') params.append('entityType', entityFilter);

      const response = await api.get(`/activities?${params}`);
      setActivities(response.data.data || []);
      setTotalPages(response.data.meta?.last_page || 1);
    } catch (error) {
      toast.error('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'login':
      case 'logout':
        return <UserIcon className="h-4 w-4" />;
      case 'create':
        return <FileIcon className="h-4 w-4" />;
      case 'update':
        return <FileIcon className="h-4 w-4" />;
      case 'delete':
        return <FileIcon className="h-4 w-4" />;
      case 'download':
        return <FileIcon className="h-4 w-4" />;
      case 'share':
        return <ShareIcon className="h-4 w-4" />;
      default:
        return <ActivityIcon className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'login':
        return 'bg-green-500/20 text-green-400';
      case 'logout':
        return 'bg-red-500/20 text-red-400';
      case 'create':
        return 'bg-blue-500/20 text-blue-400';
      case 'update':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'delete':
        return 'bg-red-500/20 text-red-400';
      case 'download':
        return 'bg-purple-500/20 text-purple-400';
      case 'share':
        return 'bg-pink-500/20 text-pink-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'user':
        return <UserIcon className="h-4 w-4" />;
      case 'file':
        return <FileIcon className="h-4 w-4" />;
      case 'folder':
        return <FolderIcon className="h-4 w-4" />;
      case 'share':
        return <ShareIcon className="h-4 w-4" />;
      default:
        return <ActivityIcon className="h-4 w-4" />;
    }
  };

  const formatActionDescription = (activity: Activity) => {
    const { action, entityType, details, user } = activity;

    switch (action) {
      case 'login':
        return `${user.username} logged in`;
      case 'logout':
        return `${user.username} logged out`;
      case 'create':
        return `${user.username} created ${entityType} "${details?.name || details?.originalName || 'Unknown'}"`;
      case 'update':
        return `${user.username} updated ${entityType} "${details?.name || details?.originalName || 'Unknown'}"`;
      case 'delete':
        return `${user.username} deleted ${entityType} "${details?.name || details?.originalName || 'Unknown'}"`;
      case 'download':
        return `${user.username} downloaded file "${details?.originalName || 'Unknown'}"`;
      case 'share':
        return `${user.username} shared ${entityType} "${details?.name || details?.originalName || 'Unknown'}"`;
      default:
        return `${user.username} performed ${action} on ${entityType}`;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const uniqueActions = Array.from(new Set(activities.map(a => a.action).filter(Boolean)));
  const uniqueEntities = Array.from(new Set(activities.map(a => a.entityType).filter(Boolean)));

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-zinc-700 rounded w-1/4"></div>
          <div className="h-64 bg-zinc-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">All Activities</h1>
          <p className="text-zinc-400 mt-1">
            Complete audit trail of all system activities
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-zinc-900/50 border-zinc-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">
              Total Activities
            </CardTitle>
            <ActivityIcon className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{activities.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">
              Today's Activities
            </CardTitle>
            <CalendarIcon className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {activities.filter(a => {
                const today = new Date().toDateString();
                return new Date(a.createdAt).toDateString() === today;
              }).length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">
              Unique Users
            </CardTitle>
            <UserIcon className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {new Set(activities.map(a => a.user.id)).size}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">
              File Operations
            </CardTitle>
            <FileIcon className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {activities.filter(a => a.entityType === 'file').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-zinc-900/50 border-zinc-700/50">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
              <Input
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-zinc-800 border-zinc-600"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-40 bg-zinc-800 border-zinc-600">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-600">
                <SelectItem value="all">All Actions</SelectItem>
                {uniqueActions.map(action => (
                  <SelectItem key={action} value={action}>
                    {action.charAt(0).toUpperCase() + action.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="w-40 bg-zinc-800 border-zinc-600">
                <SelectValue placeholder="Entity" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-600">
                <SelectItem value="all">All Entities</SelectItem>
                {uniqueEntities.map(entity => (
                  <SelectItem key={entity} value={entity}>
                    {entity.charAt(0).toUpperCase() + entity.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Activities Table */}
      <Card className="bg-zinc-900/50 border-zinc-700/50">
        <CardHeader>
          <CardTitle className="text-white">Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-zinc-300">Activity</TableHead>
                <TableHead className="text-zinc-300">User</TableHead>
                <TableHead className="text-zinc-300">Entity</TableHead>
                <TableHead className="text-zinc-300">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded ${getActionColor(activity.action)}`}>
                        {getActionIcon(activity.action)}
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {formatActionDescription(activity)}
                        </p>
                        <p className="text-zinc-400 text-sm">
                          {activity.ipAddress}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-white font-medium">{activity.user.username}</p>
                      <p className="text-zinc-400 text-sm">{activity.user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getEntityIcon(activity.entityType)}
                      <Badge variant="secondary" className="text-xs">
                        {activity.entityType}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-400">
                    {formatDate(activity.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-zinc-400 py-2 px-4">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
