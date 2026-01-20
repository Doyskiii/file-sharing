'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSession } from '@/hooks/use-session';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  UploadIcon,
  DownloadIcon,
  TrashIcon,
  EditIcon,
  FolderIcon,
  FileIcon,
  SearchIcon,
  FilterIcon,
  MoreHorizontalIcon,
  ShareIcon,
  LoaderIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  LockIcon
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { ShareFileDialog } from '@/components/dialogs/share-file-dialog';
import { FileUploadDialog } from '@/components/dialogs/file-upload-dialog';
import { ConfirmationDialog } from '@/components/dialogs/confirmation-dialog';
import { PreviewModal } from '@/components/ui/preview-modal';
import { Breadcrumb } from '@/components/navigation/breadcrumb';

interface File {
  id: number;
  name: string;
  originalName: string;
  size: number;
  mimeType: string;
  folderId: number | null;
  createdAt: string;
  updatedAt: string;
  isEncrypted?: boolean;
  folder?: {
    id: number;
    name: string;
  };
}

interface BreadcrumbItem {
  id: number;
  name: string;
}

export default function AllFilesPage() {
  const { user } = useSession();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  const [breadcrumbPath, setBreadcrumbPath] = useState<BreadcrumbItem[]>([]);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedFileForShare, setSelectedFileForShare] = useState<File | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFileForDelete, setSelectedFileForDelete] = useState<File | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedFileForPreview, setSelectedFileForPreview] = useState<File | null>(null);
  const [downloadingFileId, setDownloadingFileId] = useState<number | null>(null);
  const [deletingFileId, setDeletingFileId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    fetchFiles();
  }, [selectedFolder]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFiles();
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm, sortBy, sortOrder, filterType]);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'u',
      ctrl: true,
      action: () => setUploadDialogOpen(true),
    },
    {
      key: 's',
      ctrl: true,
      action: () => searchInputRef.current?.focus(),
    },
  ]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedFolder) params.append('folderId', selectedFolder.toString());
      if (searchTerm) params.append('search', searchTerm);
      if (sortBy) params.append('sortBy', sortBy);
      if (sortOrder) params.append('sortOrder', sortOrder);
      if (filterType && filterType !== 'all') params.append('type', filterType);

      const response = await api.get(`/files?${params}`);
      setFiles(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (file: File) => {
    setDownloadingFileId(file.id);
    try {
      const response = await api.get(`/files/${file.id}/download`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.originalName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('File downloaded successfully');
    } catch (error) {
      toast.error('Failed to download file');
    } finally {
      setDownloadingFileId(null);
    }
  };

  const handleDelete = async (file: File) => {
    setSelectedFileForDelete(file);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedFileForDelete) return;

    setDeletingFileId(selectedFileForDelete.id);
    try {
      await api.delete(`/files/${selectedFileForDelete.id}`);
      setFiles(files.filter(f => f.id !== selectedFileForDelete.id));
      toast.success('File deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedFileForDelete(null);
    } catch (error) {
      toast.error('Failed to delete file');
    } finally {
      setDeletingFileId(null);
    }
  };

  const handleUploadComplete = () => {
    fetchFiles(); // Refresh the file list
  };

  const handleBreadcrumbNavigate = (folderId: number | null) => {
    setSelectedFolder(folderId);
    // Update breadcrumb path based on navigation
    if (folderId === null) {
      setBreadcrumbPath([]);
    } else {
      // In a real implementation, you'd fetch the path from the API
      // For now, we'll just update the current folder
      // This would need to be enhanced with proper path fetching
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
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">All Files</h1>
          <p className="text-zinc-400 mt-1 text-sm md:text-base">
            Manage and organize your files
          </p>
        </div>
        <Button
          onClick={() => setUploadDialogOpen(true)}
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <UploadIcon className="h-4 w-4" />
          Upload File
        </Button>
      </div>

      {/* Breadcrumb Navigation */}
      {selectedFolder && (
        <Card className="bg-zinc-900/50 border-zinc-700/50">
          <CardContent className="p-4">
            <Breadcrumb
              items={breadcrumbPath}
              onNavigate={handleBreadcrumbNavigate}
            />
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card className="bg-zinc-900/50 border-zinc-700/50">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
              <Input
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <ArrowUpDownIcon className="h-4 w-4 mr-2" />
                  Sort & Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {/* Sort Options */}
                <div className="px-2 py-1.5 text-sm font-semibold text-zinc-300">
                  Sort by
                </div>
                <DropdownMenuItem
                  onClick={() => setSortBy('name')}
                  className={sortBy === 'name' ? 'bg-zinc-700' : ''}
                >
                  Name
                  {sortBy === 'name' && (
                    sortOrder === 'asc' ? <ArrowUpIcon className="h-4 w-4 ml-auto" /> : <ArrowDownIcon className="h-4 w-4 ml-auto" />
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSortBy('size')}
                  className={sortBy === 'size' ? 'bg-zinc-700' : ''}
                >
                  Size
                  {sortBy === 'size' && (
                    sortOrder === 'asc' ? <ArrowUpIcon className="h-4 w-4 ml-auto" /> : <ArrowDownIcon className="h-4 w-4 ml-auto" />
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSortBy('date')}
                  className={sortBy === 'date' ? 'bg-zinc-700' : ''}
                >
                  Date
                  {sortBy === 'date' && (
                    sortOrder === 'asc' ? <ArrowUpIcon className="h-4 w-4 ml-auto" /> : <ArrowDownIcon className="h-4 w-4 ml-auto" />
                  )}
                </DropdownMenuItem>

                {/* Sort Order Toggle */}
                <div className="border-t border-zinc-700 my-1"></div>
                <DropdownMenuItem
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? <ArrowDownIcon className="h-4 w-4 mr-2" /> : <ArrowUpIcon className="h-4 w-4 mr-2" />}
                  {sortOrder === 'asc' ? 'Descending' : 'Ascending'}
                </DropdownMenuItem>

                {/* Filter Options */}
                <div className="border-t border-zinc-700 my-1"></div>
                <div className="px-2 py-1.5 text-sm font-semibold text-zinc-300">
                  Filter by type
                </div>
                <DropdownMenuItem
                  onClick={() => setFilterType('all')}
                  className={filterType === 'all' ? 'bg-zinc-700' : ''}
                >
                  All Files
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setFilterType('image')}
                  className={filterType === 'image' ? 'bg-zinc-700' : ''}
                >
                  Images
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setFilterType('video')}
                  className={filterType === 'video' ? 'bg-zinc-700' : ''}
                >
                  Videos
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setFilterType('document')}
                  className={filterType === 'document' ? 'bg-zinc-700' : ''}
                >
                  Documents
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setFilterType('archive')}
                  className={filterType === 'archive' ? 'bg-zinc-700' : ''}
                >
                  Archives
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Files List */}
      <Card className="bg-zinc-900/50 border-zinc-700/50">
        <CardHeader>
          <CardTitle className="text-white">Files ({files.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {files.length === 0 ? (
            <div className="text-center py-12">
              <FileIcon className="h-12 w-12 text-zinc-500 mx-auto mb-4" />
              <p className="text-zinc-400">No files found</p>
              <p className="text-zinc-500 text-sm mt-1">
                Upload your first file to get started
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg hover:bg-zinc-700/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{getFileIcon(file.mimeType)}</div>
                    <div>
                      <p className="text-white font-medium">{file.originalName}</p>
                      <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <span>{formatFileSize(file.size)}</span>
                        <span>•</span>
                        <span>{formatDate(file.createdAt)}</span>
                        {file.folder && (
                          <>
                            <span>•</span>
                            <Badge variant="secondary" className="text-xs">
                              <FolderIcon className="h-3 w-3 mr-1" />
                              {file.folder.name}
                            </Badge>
                          </>
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
                        onClick={() => handleDownload(file)}
                        disabled={downloadingFileId === file.id}
                      >
                        {downloadingFileId === file.id ? (
                          <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <DownloadIcon className="h-4 w-4 mr-2" />
                        )}
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedFileForShare(file);
                          setShareDialogOpen(true);
                        }}
                      >
                        <ShareIcon className="h-4 w-4 mr-2" />
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <EditIcon className="h-4 w-4 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(file)}
                        disabled={deletingFileId === file.id}
                        className="text-red-600"
                      >
                        {deletingFileId === file.id ? (
                          <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <TrashIcon className="h-4 w-4 mr-2" />
                        )}
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Share File Dialog */}
      {selectedFileForShare && (
        <ShareFileDialog
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          fileId={selectedFileForShare.id}
          fileName={selectedFileForShare.originalName}
          onShareCreated={() => {
            // Could refresh shares data here if needed
            toast.success('File shared successfully!');
          }}
        />
      )}

      {/* File Upload Dialog */}
      <FileUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUploadComplete={handleUploadComplete}
        folderId={selectedFolder}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete File"
        description={`Are you sure you want to delete "${selectedFileForDelete?.originalName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={confirmDelete}
        loading={deletingFileId !== null}
      />
    </div>
  );
}
