'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/hooks/use-session';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  SearchIcon,
  GridIcon,
  ListIcon,
  UploadIcon
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface File {
  id: number;
  originalName: string;
  size: number;
  mimeType: string;
  path: string;
  createdAt: string;
  isEncrypted?: boolean;
}

export default function GalleryPage() {
  const { user } = useSession();
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchImages();
  }, [searchTerm]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('type', 'image');
      if (searchTerm) params.append('search', searchTerm);

      const response = await api.get(`/files?${params}`);
      setFiles(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-zinc-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square bg-zinc-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Gallery</h1>
          <p className="text-zinc-400 mt-1">
            View and manage your image collection
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/files/all-files">
            <Button variant="outline">
              <UploadIcon className="h-4 w-4 mr-2" />
              Upload Images
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and View Controls */}
      <Card className="bg-zinc-900/50 border-zinc-700/50">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
              <Input
                placeholder="Search images..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-zinc-800 border-zinc-600"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <GridIcon className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <ListIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gallery Content */}
      <Card className="bg-zinc-900/50 border-zinc-700/50">
        <CardHeader>
          <CardTitle className="text-white">Images ({files.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {files.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🖼️</div>
              <p className="text-zinc-400">No images found</p>
              <p className="text-zinc-500 text-sm mt-1">
                Upload some images to get started
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="group relative aspect-square bg-zinc-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer"
                >
                  <img
                    src={`/api/files/${file.id}/preview`}
                    alt={file.originalName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-image.png';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <div className="text-white">
                      <p className="font-medium text-sm truncate">{file.originalName}</p>
                      <p className="text-xs text-zinc-300">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  {file.isEncrypted && (
                    <div className="absolute top-2 right-2 bg-blue-600/80 text-white text-xs px-2 py-1 rounded">
                      🔒 Encrypted
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-4 p-4 bg-zinc-800/50 rounded-lg hover:bg-zinc-700/50 transition-colors"
                >
                  <div className="w-16 h-16 bg-zinc-700 rounded overflow-hidden flex-shrink-0">
                    <img
                      src={`/api/files/${file.id}/preview`}
                      alt={file.originalName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-image.png';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{file.originalName}</p>
                    <p className="text-zinc-400 text-sm">{formatFileSize(file.size)}</p>
                  </div>
                  {file.isEncrypted && (
                    <div className="bg-blue-600/20 text-blue-300 text-xs px-2 py-1 rounded">
                      🔒 Encrypted
                    </div>
                  )}
                  <Button variant="ghost" size="sm">
                    Download
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}