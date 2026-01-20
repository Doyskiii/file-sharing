'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/hooks/use-session';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  ShieldCheckIcon,
  ShieldPlusIcon,
  EditIcon,
  TrashIcon,
  CheckIcon,
  MoreHorizontalIcon
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface Permission {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  rolesCount?: number;
}

export default function AdminPermissionsPage() {
  const { user } = useSession();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      const response = await api.get('/permissions');
      setPermissions(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load permissions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePermission = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api.post('/permissions', {
        name: formData.name,
        description: formData.description,
      });

      toast.success('Permission created successfully');
      setCreateDialogOpen(false);
      resetForm();
      fetchPermissions();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create permission');
    }
  };

  const handleEditPermission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPermission) return;

    try {
      await api.put(`/permissions/${selectedPermission.id}`, {
        name: formData.name,
        description: formData.description,
      });

      toast.success('Permission updated successfully');
      setEditDialogOpen(false);
      setSelectedPermission(null);
      resetForm();
      fetchPermissions();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update permission');
    }
  };

  const handleDeletePermission = async (permissionId: number) => {
    if (!confirm('Are you sure you want to delete this permission? This may affect roles that use it.')) return;

    try {
      await api.delete(`/permissions/${permissionId}`);
      setPermissions(permissions.filter(p => p.id !== permissionId));
      toast.success('Permission deleted successfully');
    } catch (error) {
      toast.error('Failed to delete permission');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
    });
  };

  const openEditDialog = (permission: Permission) => {
    setSelectedPermission(permission);
    setFormData({
      name: permission.name,
      description: permission.description,
    });
    setEditDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Group permissions by category for better organization
  const groupedPermissions = permissions.reduce((acc, permission) => {
    const category = permission.name.split(':')[0] || 'general';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

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
          <h1 className="text-3xl font-bold text-white">Permission Management</h1>
          <p className="text-zinc-400 mt-1">
            Manage system permissions and access controls
          </p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <ShieldPlusIcon className="h-4 w-4" />
          Create Permission
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-zinc-900/50 border-zinc-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">
              Total Permissions
            </CardTitle>
            <ShieldCheckIcon className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{permissions.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">
              Categories
            </CardTitle>
            <CheckIcon className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{Object.keys(groupedPermissions).length}</div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">
              System Permissions
            </CardTitle>
            <ShieldCheckIcon className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{permissions.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Permissions by Category */}
      {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
        <Card key={category} className="bg-zinc-900/50 border-zinc-700/50">
          <CardHeader>
            <CardTitle className="text-white capitalize flex items-center gap-2">
              <ShieldCheckIcon className="h-5 w-5" />
              {category} Permissions ({categoryPermissions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-zinc-300">Permission</TableHead>
                  <TableHead className="text-zinc-300">Description</TableHead>
                  <TableHead className="text-zinc-300">Roles</TableHead>
                  <TableHead className="text-zinc-300">Created</TableHead>
                  <TableHead className="text-zinc-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoryPermissions.map((permission) => (
                  <TableRow key={permission.id}>
                    <TableCell>
                      <div>
                        <p className="text-white font-medium">{permission.name}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-zinc-400">
                      {permission.description}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {permission.rolesCount || 0} roles
                      </Badge>
                    </TableCell>
                    <TableCell className="text-zinc-400">
                      {formatDate(permission.createdAt)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontalIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(permission)}>
                            <EditIcon className="h-4 w-4 mr-2" />
                            Edit Permission
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeletePermission(permission.id)}>
                            <TrashIcon className="h-4 w-4 mr-2" />
                            Delete Permission
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}

      {/* Create Permission Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-zinc-900 border-zinc-700">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Permission</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Add a new permission to the system
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreatePermission}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-zinc-300">Permission Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="bg-zinc-800 border-zinc-600"
                  placeholder="e.g., user:create, file:read"
                  required
                />
                <p className="text-xs text-zinc-500">
                  Use format: resource:action (e.g., user:create, file:read, role:update)
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description" className="text-zinc-300">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="bg-zinc-800 border-zinc-600"
                  placeholder="Describe what this permission allows"
                  rows={3}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Permission</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Permission Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-zinc-900 border-zinc-700">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Permission</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Update permission information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditPermission}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name" className="text-zinc-300">Permission Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="bg-zinc-800 border-zinc-600"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description" className="text-zinc-300">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="bg-zinc-800 border-zinc-600"
                  rows={3}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Permission</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
