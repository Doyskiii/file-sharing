'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/hooks/use-session';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LinkIcon, TrashIcon, MoreHorizontalIcon, CopyIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface PublicShare {
  id: number;
  fileId: number;
  token: string;
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
}

export default function SharedByLinkPage() {
  const { user } = useSession();
  const [publicShares, setPublicShares] = useState<PublicShare[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicShares();
  }, []);

  const fetchPublicShares = async () => {
    try {
      setLoading(true);
      const response = await api.get('/shares/public');
      setPublicShares(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load public shares');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeShare = async (shareId: number) => {
    if (!confirm('Are you sure you want to revoke this public share?')) return;

    try {
      await api.delete(`/shares/${shareId}`);
      setPublicShares(publicShares.filter(share => share.id !== shareId));
      toast.success('Public share revoked successfully');
    } catch (error) {
      toast.error('Failed to revoke share');
    }
  };

  const handleCopyLink = async (token: string) => {
    const shareUrl = `${window.location.origin}/share/${token}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy link');
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
          <h1 className="text-3xl font-bold text-white">Shared by Link</h1>
          <p className="text-zinc-400 mt-1">
            Public links you've created for file sharing
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <LinkIcon className="h-4 w-4" />
          Create Public Link
        </Button>
      </div>

      <Card className="bg-zinc-900/50 border-zinc-700/50">
        <CardHeader>
          <CardTitle className="text-white">Public Share Links</CardTitle>
        </CardHeader>
        <CardContent>
          {publicShares.length === 0 ? (
            <div className="text-center py-12">
              <LinkIcon className="h-12 w-12 text-zinc-500 mx-auto mb-4" />
              <p className="text-zinc-400">No public share links yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {publicShares.map((share) => {
                const isExpired = share.expiresAt && new Date(share.expiresAt) <= new Date();
                return (
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
                          <span>Created {formatDate(share.createdAt)}</span>
                          {share.expiresAt && (
                            <>
                              <span>•</span>
                              <span>Expires {formatDate(share.expiresAt)}</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {share.accessType}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Public Link
                          </Badge>
                          {isExpired && (
                            <Badge variant="destructive" className="text-xs">
                              Expired
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
                        {!isExpired && (
                          <DropdownMenuItem onClick={() => handleCopyLink(share.token)}>
                            <CopyIcon className="h-4 w-4 mr-2" />
                            Copy Link
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleRevokeShare(share.id)}
                          className="text-red-600"
                        >
                          <TrashIcon className="h-4 w-4 mr-2" />
                          Revoke Link
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
