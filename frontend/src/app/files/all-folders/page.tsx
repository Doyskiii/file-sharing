'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/hooks/use-session';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  FolderIcon,
  FolderOpenIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  MoreHorizontalIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  LoaderIcon,
  FileIcon
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { ConfirmationDialog } from '@/components/dialogs/confirmation-dialog';

interface Folder {
  id: number;
  name: string;
  ownerId: number;
  parentId: number | null;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: number;
    email: string;
  };
  parent?: {
    id: number;
    name: string;
  };
  children?: Folder[];
  filesCount?: number;
}

interface FolderNode extends Folder {
  isExpanded: boolean;
  level: number;
}

export default function AllFoldersPage() {
  const { user } = useSession();
  const [folders, setFolders] = useState<FolderNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingFolder, setCreatingFolder] = useState<{ parentId: number | null; name: string } | null>(null);
  const [editingFolder, setEditingFolder] = useState<{ id: number; name: string } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFolderForDelete, setSelectedFolderForDelete] = useState<Folder | null>(null);
  const [operationLoading, setOperationLoading] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/folders');
      const folderData = response.data.data || [];

      // Convert to tree structure
      const folderTree = buildFolderTree(folderData);
      setFolders(folderTree);
    } catch (error) {
      toast.error('Failed to load folders');
    } finally {
      setLoading(false);
    }
  };

  const buildFolderTree = (folders: Folder[]): FolderNode[] => {
    const folderMap = new Map<number, FolderNode>();
    const rootFolders: FolderNode[] = [];

    // First pass: create all nodes
    folders.forEach(folder => {
      folderMap.set(folder.id, {
        ...folder,
        isExpanded: false,
        level: 0,
        children: [],
      });
    });

    // Second pass: build hierarchy
    folders.forEach(folder => {
      const node = folderMap.get(folder.id)!;

      if (folder.parentId) {
        const parent = folderMap.get(folder.parentId);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(node);
          node.level = parent.level + 1;
        }
      } else {
        rootFolders.push(node);
      }
    });

    return rootFolders;
  };

  const toggleFolder = (folderId: number) => {
    setFolders(prev => updateFolderExpansion(prev, folderId));
  };

  const updateFolderExpansion = (folders: FolderNode[], folderId: number): FolderNode[] => {
    return folders.map(folder => {
      if (folder.id === folderId) {
        return { ...folder, isExpanded: !folder.isExpanded };
      }
      if (folder.children) {
        return { ...folder, children: updateFolderExpansion(folder.children, folderId) };
      }
      return folder;
    });
  };

  const handleCreateFolder = async (parentId: number | null = null) => {
    if (!creatingFolder || !creatingFolder.name.trim()) return;

    const operationKey = `create-${parentId || 'root'}`;
    setOperationLoading(prev => ({ ...prev, [operationKey]: true }));

    try {
      await api.post('/folders', {
        name: creatingFolder.name.trim(),
        parentId: parentId,
      });

      toast.success('Folder created successfully');
      setCreatingFolder(null);
      fetchFolders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create folder');
    } finally {
      setOperationLoading(prev => ({ ...prev, [operationKey]: false }));
    }
  };

  const handleRenameFolder = async (folderId: number) => {
    if (!editingFolder || !editingFolder.name.trim()) return;

    const operationKey = `rename-${folderId}`;
    setOperationLoading(prev => ({ ...prev, [operationKey]: true }));

    try {
      await api.put(`/folders/${folderId}`, {
        name: editingFolder.name.trim(),
      });

      toast.success('Folder renamed successfully');
      setEditingFolder(null);
      fetchFolders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to rename folder');
    } finally {
      setOperationLoading(prev => ({ ...prev, [operationKey]: false }));
    }
  };

  const handleDeleteFolder = async () => {
    if (!selectedFolderForDelete) return;

    const operationKey = `delete-${selectedFolderForDelete.id}`;
    setOperationLoading(prev => ({ ...prev, [operationKey]: true }));

    try {
      await api.delete(`/folders/${selectedFolderForDelete.id}`);
      toast.success('Folder deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedFolderForDelete(null);
      fetchFolders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete folder');
    } finally {
      setOperationLoading(prev => ({ ...prev, [operationKey]: false }));
    }
  };

  const renderFolderNode = (folder: FolderNode): JSX.Element => {
    const hasChildren = folder.children && folder.children.length > 0;
    const isCreatingHere = creatingFolder?.parentId === folder.id;
    const isEditingThis = editingFolder?.id === folder.id;
    const isOperationLoading = operationLoading[`create-${folder.id}`] ||
                              operationLoading[`rename-${folder.id}`] ||
                              operationLoading[`delete-${folder.id}`];

    return (
      <div key={folder.id}>
        <div
          className={`
            flex items-center gap-2 p-2 rounded-lg hover:bg-zinc-700/50 transition-colors
            ${folder.level > 0 ? 'ml-6' : ''}
          `}
        >
          {/* Expand/Collapse Button */}
          {hasChildren ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleFolder(folder.id)}
              className="h-6 w-6 p-0"
            >
              {folder.isExpanded ? (
                <ChevronDownIcon className="h-4 w-4" />
              ) : (
                <ChevronRightIcon className="h-4 w-4" />
              )}
            </Button>
          ) : (
            <div className="w-6" />
          )}

          {/* Folder Icon */}
          <div className="text-blue-400">
            {folder.isExpanded ? (
              <FolderOpenIcon className="h-5 w-5" />
            ) : (
              <FolderIcon className="h-5 w-5" />
            )}
          </div>

          {/* Folder Name / Edit Input */}
          {isEditingThis ? (
            <Input
              value={editingFolder.name}
              onChange={(e) => setEditingFolder({ ...editingFolder, name: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRenameFolder(folder.id);
                if (e.key === 'Escape') setEditingFolder(null);
              }}
              onBlur={() => handleRenameFolder(folder.id)}
              className="h-7 text-sm flex-1"
              autoFocus
            />
          ) : (
            <span className="text-white font-medium flex-1">{folder.name}</span>
          )}

          {/* File Count Badge */}
          {folder.filesCount !== undefined && folder.filesCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              <FileIcon className="h-3 w-3 mr-1" />
              {folder.filesCount}
            </Badge>
          )}

          {/* Actions Menu */}
          {!isEditingThis && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" disabled={isOperationLoading}>
                  {isOperationLoading ? (
                    <LoaderIcon className="h-4 w-4 animate-spin" />
                  ) : (
                    <MoreHorizontalIcon className="h-4 w-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setCreatingFolder({ parentId: folder.id, name: '' })}
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  New Folder
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setEditingFolder({ id: folder.id, name: folder.name })}
                >
                  <EditIcon className="h-4 w-4 mr-2" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedFolderForDelete(folder);
                    setDeleteDialogOpen(true);
                  }}
                  className="text-red-600"
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Create Folder Input */}
        {isCreatingHere && (
          <div className="ml-8 mt-1">
            <Input
              placeholder="New folder name"
              value={creatingFolder.name}
              onChange={(e) => setCreatingFolder({ ...creatingFolder, name: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFolder(folder.id);
                if (e.key === 'Escape') setCreatingFolder(null);
              }}
              onBlur={() => handleCreateFolder(folder.id)}
              className="h-7 text-sm"
              autoFocus
            />
          </div>
        )}

        {/* Children */}
        {folder.isExpanded && folder.children && (
          <div className="ml-2">
            {folder.children.map(child => renderFolderNode(child))}
          </div>
        )}
      </div>
    );
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
          <h1 className="text-3xl font-bold text-white">All Folders</h1>
          <p className="text-zinc-400 mt-1">
            Organize your files with folders
          </p>
        </div>
        <Button
          onClick={() => setCreatingFolder({ parentId: null, name: '' })}
          className="flex items-center gap-2"
        >
          <PlusIcon className="h-4 w-4" />
          New Folder
        </Button>
      </div>

      {/* Root Level Create Folder Input */}
      {creatingFolder && creatingFolder.parentId === null && (
        <Card className="bg-zinc-900/50 border-zinc-700/50">
          <CardContent className="p-4">
            <Input
              placeholder="New folder name"
              value={creatingFolder.name}
              onChange={(e) => setCreatingFolder({ ...creatingFolder, name: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFolder(null);
                if (e.key === 'Escape') setCreatingFolder(null);
              }}
              onBlur={() => handleCreateFolder(null)}
              className="h-8"
              autoFocus
            />
          </CardContent>
        </Card>
      )}

      {/* Folders Tree */}
      <Card className="bg-zinc-900/50 border-zinc-700/50">
        <CardHeader>
          <CardTitle className="text-white">Folders ({folders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {folders.length === 0 && !creatingFolder ? (
            <div className="text-center py-12">
              <FolderIcon className="h-12 w-12 text-zinc-500 mx-auto mb-4" />
              <p className="text-zinc-400">No folders found</p>
              <p className="text-zinc-500 text-sm mt-1">
                Create your first folder to get started
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {folders.map(folder => renderFolderNode(folder))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Folder"
        description={`Are you sure you want to delete "${selectedFolderForDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleDeleteFolder}
        loading={selectedFolderForDelete ? operationLoading[`delete-${selectedFolderForDelete.id}`] : false}
      />
    </div>
  );
}
