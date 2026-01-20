'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/hooks/use-session';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DownloadIcon,
  EyeIcon,
  UserIcon,
  ShareIcon,
  MoreHorizontalIcon
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface ReceivedShare {
  id: number;
  fileId: number;
  sharedWithUserId: number;
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
  owner: {
    id: number;
    username: string;
    email: string;
  };
}

export default function SharedWithMePage() {
  const { user } = useSession();
  const [receivedShares, setReceivedShares] = useState<ReceivedShare[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReceivedShares();
  }, []);

  const fetchReceivedShares = async () => {
    try {
      setLoading(true);
      const response = await api.get('/shares/received');
      setReceivedShares(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load received shares');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (share: ReceivedShare) => {
    if (share.accessType !== 'download' && share.accessType !== 'edit') {
      toast.error('You do not have download permission for this file');
      return;
    }

    try {
      const response = await api.get(`/files/${share.fileId}/download/shared`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', share.file.originalName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('File downloaded successfully');
    } catch (error) {
      toast.error('Failed to download file');
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

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('zip') || mimeType.includes('rar')) return '📦';
    return '📄';
  };

  const getAccessTypeIcon = (accessType: string) => {
    switch (accessType) {
      case 'view': return <EyeIcon className="h-4 w-4" />;
      case 'download': return <DownloadIcon className="h-4 w-4" />;
      case 'edit': return <ShareIcon className="h-4 w-4" />;
      default: return <EyeIcon className="h-4 w-4" />;
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
          <h1 className="text-3xl font-bold text-white">Shared with Me</h1>
          <p className="text-zinc-400 mt-1">
            Files that others have shared with you
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-zinc-900/50 border-zinc-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">
              Total Received
            </CardTitle>
            <ShareIcon className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{receivedShares.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">
              Can Download
            </CardTitle>
            <DownloadIcon className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {receivedShares.filter(s => s.accessType === 'download' || s.accessType === 'edit').length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">
              View Only
            </CardTitle>
            <EyeIcon className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {receivedShares.filter(s => s.accessType === 'view').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Received Shares List */}
      <Card className="bg-zinc-900/50 border-zinc-700/50">
        <CardHeader>
          <CardTitle className="text-white">Files Shared with You</CardTitle>
        </CardHeader>
        <CardContent>
          {receivedShares.length === 0 ? (
            <div className="text-center py-12">
              <ShareIcon className="h-12 w-12 text-zinc-500 mx-auto mb-4" />
              <p className="text-zinc-400">No files shared with you yet</p>
              <p className="text-zinc-500 text-sm mt-1">
                When others share files with you, they will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {receivedShares.map((share) => (
                <div
                  key={share.id}
                  className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg hover:bg-zinc-700/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{getFileIcon(share.file.mimeType)}</div>
                    <div>
                      <p className="text-white font-medium">{share.file.originalName}</p>
                      <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <span>{formatFileSize(share.file.size)}</span>
                        <span>•</span>
                        <span>Shared by {share.owner.username}</span>
                        <span>•</span>
                        <span>{formatDate(share.createdAt)}</span>
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
                        <Badge variant="outline" className="text-xs">
                          <UserIcon className="h-3 w-3 mr-1" />
                          {share.owner.username}
                        </Badge>
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
                      {(share.accessType === 'download' || share.accessType === 'edit') && (
                        <DropdownMenuItem onClick={() => handleDownload(share)}>
                          <DownloadIcon className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem>
                        <EyeIcon className="h-4 w-4 mr-2" />
                        View Details
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
