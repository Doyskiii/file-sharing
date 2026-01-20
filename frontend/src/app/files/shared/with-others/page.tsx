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

interface OwnedShare {
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

export default function SharedWithOthersPage() {
  const { user } = useSession();
  const [ownedShares, setOwnedShares] = useState<OwnedShare[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOwnedShares();
  }, []);

  const fetchOwnedShares = async () => {
    try {
      setLoading(true);
      const response = await api.get('/shares/owned');
      setOwnedShares(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load owned shares');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeShare = async (shareId: number) => {
    if (!confirm('Are you sure you want to revoke this share?')) return;

    try {
      await api.delete(`/shares/${shareId}`);
      setOwnedShares(ownedShares.filter(share => share.id !== shareId));
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Shared with Others</h1>
          <p className="text-zinc-400 mt-1">
            Files you've shared with other users
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <ShareIcon className="h-4 w-4" />
          Share New File
        </Button>
      </div>

      <Card className="bg-zinc-900/50 border-zinc-700/50">
        <CardHeader>
          <CardTitle className="text-white">Files You've Shared</CardTitle>
        </CardHeader>
        <CardContent>
          {ownedShares.length === 0 ? (
            <div className="text-center py-12">
              <ShareIcon className="h-12 w-12 text-zinc-500 mx-auto mb-4" />
              <p className="text-zinc-400">You haven't shared any files yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {ownedShares.map((share) => (
                <div
                  key={share.id}
                  className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-white font-medium">{share.file.originalName}</p>
                      <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <span>{formatFileSize(share.file.size)}</span>
                        <span>•</span>
                        <span>Shared {formatDate(share.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {share.accessType}
                        </Badge>
                        {share.sharedWithUser && (
                          <Badge variant="outline" className="text-xs">
                            {share.sharedWithUser.username}
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
