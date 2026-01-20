'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/hooks/use-session';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ShareIcon,
  UserIcon,
  LinkIcon,
  EyeIcon,
  DownloadIcon,
  TrashIcon,
  MoreHorizontalIcon
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface FileShare {
  id: number;
  fileId: number;
  sharedWithUserId: number | null;
  token: string | null;
  accessType: 'view' | 'edit' | 'download';
  expiresAt: string | null;
  createdAt: string;
  file: {
    id: number;
    name: string;
    originalName: string;
    size: number;
    mimeType: string;
  };
  sharedWithUser?: {
    id: number;
    username: string;
    email: string;
  };
}

export default function SharedOverviewPage() {
  const { user } = useSession();
  const [sharedFiles, setSharedFiles] = useState<FileShare[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSharedFiles();
  }, []);

  const fetchSharedFiles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/shares/owned');
      setSharedFiles(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load shared files');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeShare = async (shareId: number) => {
    if (!confirm('Are you sure you want to revoke this share?')) return;

    try {
      await api.delete(`/shares/${shareId}`);
      setSharedFiles(sharedFiles.filter(share => share.id !== shareId));
      toast.success('Share revoked successfully');
    } catch (error) {
      toast.error('Failed to revoke share');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getAccessTypeIcon = (accessType: string) => {
    switch (accessType) {
      case 'view': return <EyeIcon className="h-4 w-4" />;
      case 'download': return <DownloadIcon className="h-4 w-4" />;
      case 'edit': return <ShareIcon className="h-4 w-4" />;
      default: return <ShareIcon className="h-4 w-4" />;
    }
  };

  const getShareTypeIcon = (share: FileShare) => {
    if (share.sharedWithUserId) {
      return <UserIcon className="h-4 w-4 text-blue-500" />;
    } else {
      return <LinkIcon className="h-4 w-4 text-green-500" />;
    }
  };

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
          <h1 className="text-3xl font-bold text-white">Shared Files Overview</h1>
          <p className="text-zinc-400 mt-1">
            Manage files you've shared with others
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <ShareIcon className="h-4 w-4" />
          Share New File
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-zinc-900/50 border-zinc-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">
              Total Shared
            </CardTitle>
            <ShareIcon className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{sharedFiles.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">
              Private Shares
            </CardTitle>
            <UserIcon className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {sharedFiles.filter(s => s.sharedWithUserId).length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">
              Public Links
            </CardTitle>
            <LinkIcon className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {sharedFiles.filter(s => s.token).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shared Files List */}
      <Card className="bg-zinc-900/50 border-zinc-700/50">
        <CardHeader>
          <CardTitle className="text-white">Your Shared Files</CardTitle>
        </CardHeader>
        <CardContent>
          {sharedFiles.length === 0 ? (
            <div className="text-center py-12">
              <ShareIcon className="h-12 w-12 text-zinc-500 mx-auto mb-4" />
              <p className="text-zinc-400">No shared files yet</p>
              <p className="text-zinc-500 text-sm mt-1">
                Share your files with others to collaborate
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {sharedFiles.map((share) => (
                <div
                  key={share.id}
                  className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg hover:bg-zinc-700/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {getShareTypeIcon(share)}
                    <div>
                      <p className="text-white font-medium">{share.file.originalName}</p>
                      <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <span>{formatFileSize(share.file.size)}</span>
                        <span>•</span>
                        <span>Shared {formatDate(share.createdAt)}</span>
                        {share.expiresAt && (
                          <>
                            <span>•</span>
                            <span>Expires {formatDate(share.expiresAt)}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {getAccessTypeIcon(share.accessType)}
                          <span className="ml-1 capitalize">{share.accessType}</span>
                        </Badge>
                        {share.sharedWithUser && (
                          <Badge variant="outline" className="text-xs">
                            <UserIcon className="h-3 w-3 mr-1" />
                            {share.sharedWithUser.username}
                          </Badge>
                        )}
                        {share.token && (
                          <Badge variant="outline" className="text-xs">
                            <LinkIcon className="h-3 w-3 mr-1" />
                            Public Link
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontalIcon className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <EyeIcon className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <ShareIcon className="h-4 w-4 mr-2" />
                        Update Permissions
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleRevokeShare(share.id)}
                        className="text-red-600"
                      >
                        <TrashIcon className="h-4 w-4 mr-2" />
                        Revoke Share
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
