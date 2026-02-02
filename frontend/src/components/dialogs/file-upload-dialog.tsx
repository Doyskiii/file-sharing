'use client';

import { useState, useCallback, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import {
  UploadIcon,
  XIcon,
  FileIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  LockIcon
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

interface FileUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete?: () => void;
  folderId?: number | null;
  accept?: string;
}

interface UploadFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export function FileUploadDialog({
  open,
  onOpenChange,
  onUploadComplete,
  folderId = null,
  accept = "*/*",
}: FileUploadDialogProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [encryptFiles, setEncryptFiles] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    addFiles(selectedFiles);
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const addFiles = (newFiles: File[]) => {
    const uploadFiles: UploadFile[] = newFiles.map(file => ({
      file,
      progress: 0,
      status: 'pending',
    }));

    setFiles(prev => [...prev, ...uploadFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      // Upload files sequentially to avoid overwhelming the server
      for (let i = 0; i < files.length; i++) {
        const uploadFile = files[i];

        // Update status to uploading
        setFiles(prev => prev.map((f, idx) =>
          idx === i ? { ...f, status: 'uploading' as const } : f
        ));

        try {
          const formData = new FormData();
          formData.append('file', uploadFile.file);
          if (folderId) {
            formData.append('folderId', folderId.toString());
          }
          if (encryptFiles) {
            formData.append('encrypt', 'true');
          }

          // Simulate progress (since we can't track real progress with axios)
          const progressInterval = setInterval(() => {
            setFiles(prev => prev.map((f, idx) => {
              if (idx === i && f.progress < 90) {
                return { ...f, progress: f.progress + 10 };
              }
              return f;
            }));
          }, 200);

          const response = await api.post('/files', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          clearInterval(progressInterval);

          // Update to completed
          setFiles(prev => prev.map((f, idx) =>
            idx === i ? { ...f, progress: 100, status: 'completed' as const } : f
          ));

          successCount++;

        } catch (error: any) {
          // Update to error
          setFiles(prev => prev.map((f, idx) =>
            idx === i ? {
              ...f,
              status: 'error' as const,
              error: error.response?.data?.message || 'Upload failed'
            } : f
          ));

          errorCount++;
        }
      }

      // Show summary toast
      if (successCount > 0 && errorCount === 0) {
        toast.success(`Successfully uploaded ${successCount} file${successCount !== 1 ? 's' : ''}`);
      } else if (errorCount > 0 && successCount === 0) {
        toast.error(`Failed to upload ${errorCount} file${errorCount !== 1 ? 's' : ''}`);
      } else if (successCount > 0 && errorCount > 0) {
        toast.warning(`Uploaded ${successCount} file${successCount !== 1 ? 's' : ''}, failed ${errorCount} file${errorCount !== 1 ? 's' : ''}`);
      }

      // Call completion callback
      onUploadComplete?.();

      // Close dialog after a short delay
      setTimeout(() => {
        onOpenChange(false);
        setFiles([]);
      }, 1500);

    } catch (error) {
      toast.error('Upload process failed');
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    const type = file.type;
    if (type.startsWith('image/')) return '🖼️';
    if (type.startsWith('video/')) return '🎥';
    if (type.startsWith('audio/')) return '🎵';
    if (type.includes('pdf')) return '📄';
    if (type.includes('zip') || type.includes('rar')) return '📦';
    return '📄';
  };

  const hasCompletedFiles = files.some(f => f.status === 'completed');
  const hasErrorFiles = files.some(f => f.status === 'error');
  const canUpload = files.length > 0 && !isUploading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-700/50 max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <UploadIcon className="h-5 w-5" />
            Upload Files
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Drag and drop files here or click to browse
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragOver
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-zinc-600 hover:border-zinc-500 hover:bg-zinc-800/50'
              }
            `}
          >
            <UploadIcon className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
            <p className="text-zinc-300 mb-2">
              {isDragOver ? 'Drop files here' : 'Click to browse or drag files here'}
            </p>
            <p className="text-zinc-500 text-sm">
              Maximum file size: 50MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept={accept}
            />
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {files.map((uploadFile, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg"
                >
                  <div className="text-2xl">{getFileIcon(uploadFile.file)}</div>

                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">
                      {uploadFile.file.name}
                    </p>
                    <p className="text-zinc-400 text-sm">
                      {formatFileSize(uploadFile.file.size)}
                    </p>

                    {uploadFile.status === 'uploading' && (
                      <Progress value={uploadFile.progress} className="mt-2 h-2" />
                    )}

                    {uploadFile.status === 'error' && uploadFile.error && (
                      <p className="text-red-400 text-sm mt-1">
                        {uploadFile.error}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {uploadFile.status === 'completed' && (
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    )}
                    {uploadFile.status === 'error' && (
                      <AlertCircleIcon className="h-5 w-5 text-red-500" />
                    )}
                    {uploadFile.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(index);
                        }}
                        className="text-zinc-400 hover:text-zinc-300"
                      >
                        <XIcon className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Encryption Option */}
          {files.length > 0 && (
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="encrypt"
                checked={encryptFiles}
                onCheckedChange={(checked) => setEncryptFiles(checked as boolean)}
                disabled={isUploading}
              />
              <label
                htmlFor="encrypt"
                className="text-sm font-medium text-zinc-300 cursor-pointer"
              >
                Encrypt files with end-to-end encryption
              </label>
              {encryptFiles && <LockIcon className="h-4 w-4 text-blue-500" />}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-700/50">
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setFiles([]);
              }}
              disabled={isUploading}
              className="bg-zinc-800 border-zinc-600 text-zinc-300 hover:bg-zinc-700"
            >
              Cancel
            </Button>
            <Button
              onClick={uploadFiles}
              disabled={!canUpload}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isUploading ? 'Uploading...' : `Upload ${files.length} file${files.length !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
