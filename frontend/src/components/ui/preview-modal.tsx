import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Download, ZoomIn, ZoomOut } from 'lucide-react';
import { useState } from 'react';

interface File {
  id: number;
  name: string;
  originalName: string;
  mimeType: string;
}

interface PreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: File | null;
  downloadUrl?: string;
}

export function PreviewModal({ open, onOpenChange, file, downloadUrl }: PreviewModalProps) {
  const [zoom, setZoom] = useState(1);

  if (!file) return null;

  const isImage = file.mimeType.startsWith('image/');
  const isPdf = file.mimeType === 'application/pdf';

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.25));
  const handleDownload = () => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-4 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white">{file.originalName}</DialogTitle>
            <div className="flex items-center gap-2">
              {isImage && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleZoomOut}
                    disabled={zoom <= 0.25}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-zinc-400">{Math.round(zoom * 100)}%</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleZoomIn}
                    disabled={zoom >= 3}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </>
              )}
              {downloadUrl && (
                <Button variant="ghost" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4" />
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        <div className="p-4 pt-0 overflow-auto max-h-[calc(90vh-80px)]">
          {isImage && downloadUrl && (
            <img
              src={downloadUrl}
              alt={file.originalName}
              className="max-w-full max-h-full object-contain"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
            />
          )}
          {isPdf && downloadUrl && (
            <iframe
              src={downloadUrl}
              className="w-full h-[600px] border-0"
              title={file.originalName}
            />
          )}
          {!isImage && !isPdf && (
            <div className="text-center py-12">
              <p className="text-zinc-400">Preview not available for this file type</p>
              {downloadUrl && (
                <Button onClick={handleDownload} className="mt-4">
                  <Download className="h-4 w-4 mr-2" />
                  Download File
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
