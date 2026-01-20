'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  DownloadIcon,
  EyeIcon,
  LockIcon,
  FileIcon,
  AlertCircleIcon,
  CheckCircleIcon
} from 'lucide-react';
import { toast } from 'sonner';

interface PublicShare {
  id: number;
  fileId: number;
  token: string;
  accessType: 'view' | 'download';
  expiresAt: string | null;
  createdAt: string;
  password?: string;
  file: {
    id: number;
    name: string;
    originalName: string;
    size: number;
    mimeType: string;
  };
}

export default function PublicSharePage() {
  const params = useParams();
  const token = params.token as string;

  const [share, setShare] = useState<PublicShare | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    fetchShareDetails();
  }, [token]);

  const fetchShareDetails = async (sharePassword?: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `http://localhost:3333/shares/public/${token}`,
        {
          headers: sharePassword ? { 'X-Share-Password': sharePassword } : {},
        }
      );

      setShare(response.data.data);
      setAuthenticated(true);
      setPasswordRequired(false);
    } catch (error: any) {
      if (error.response?.status === 403) {
        setPasswordRequired(true);
        setAuthenticated(false);
      } else {
        setError(error.response?.data?.message || 'Share not found or expired');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      toast.error('Please enter a password');
      return;
    }
    await fetchShareDetails(password);
  };

  const handleDownload = async () => {
    if (!share) return;

    try {
      const response = await axios.get(
        `http://localhost:3333/files/${share.file.id}/download`,
        {
          headers: password ? { 'X-Share-Password': password } : {},
          responseType: 'blob',
        }
      );

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

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('zip') || mimeType.includes('rar')) return '📦';
    return '📄';
  };

  const isExpired = share?.expiresAt && new Date(share.expiresAt) <= new Date();

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-zinc-900 border-zinc-700">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-zinc-700 rounded w-3/4 mx-auto"></div>
              <div className="h-32 bg-zinc-700 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-zinc-900 border-zinc-700">
          <CardContent className="p-6 text-center">
            <AlertCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Share Not Available</h2>
            <p className="text-zinc-400 mb-4">{error}</p>
            <p className="text-sm text-zinc-500">
              The link may have expired or been revoked.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (passwordRequired && !authenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-zinc-900 border-zinc-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <LockIcon className="h-5 w-5" />
              Password Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-zinc-300">
                  Enter password to access this file
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-zinc-800 border-zinc-600"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Access File
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!share) return null;

  return (
    <div className="min-h-screen bg-zinc-950 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-zinc-900 border-zinc-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
              Shared File Access
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Info */}
            <div className="flex items-center gap-4 p-4 bg-zinc-800/50 rounded-lg">
              <div className="text-4xl">{getFileIcon(share.file.mimeType)}</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">{share.file.originalName}</h3>
                <div className="flex items-center gap-2 text-sm text-zinc-400 mt-1">
                  <span>{formatFileSize(share.file.size)}</span>
                  <span>•</span>
                  <Badge variant="secondary" className="text-xs">
                    {share.accessType === 'view' ? 'View Only' : 'Download Allowed'}
                  </Badge>
                  {isExpired && (
                    <Badge variant="destructive" className="text-xs">
                      Expired
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Access Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Access Type</Label>
                <div className="flex items-center gap-2">
                  {share.accessType === 'view' ? (
                    <EyeIcon className="h-4 w-4 text-blue-400" />
                  ) : (
                    <DownloadIcon className="h-4 w-4 text-green-400" />
                  )}
                  <span className="text-white capitalize">{share.accessType} Access</span>
                </div>
              </div>

              {share.expiresAt && (
                <div className="space-y-2">
                  <Label className="text-zinc-300">Expires</Label>
                  <div className={`text-white ${isExpired ? 'text-red-400' : ''}`}>
                    {new Date(share.expiresAt).toLocaleDateString()}
                    {isExpired && ' (Expired)'}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {share.accessType === 'download' && !isExpired && (
                <Button onClick={handleDownload} className="flex items-center gap-2">
                  <DownloadIcon className="h-4 w-4" />
                  Download File
                </Button>
              )}

              {share.accessType === 'view' && !isExpired && (
                <Button variant="outline" className="flex items-center gap-2">
                  <EyeIcon className="h-4 w-4" />
                  View File
                </Button>
              )}

              {isExpired && (
                <div className="flex items-center gap-2 text-zinc-400">
                  <AlertCircleIcon className="h-4 w-4" />
                  This share has expired
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="text-center text-sm text-zinc-500 border-t border-zinc-700 pt-4">
              Shared via File Sharing Application
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
