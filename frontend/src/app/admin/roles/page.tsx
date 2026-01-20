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
import { Checkbox } from '@/components/ui/checkbox';
import {
  ShieldIcon,
  ShieldPlusIcon,
  EditIcon,
  TrashIcon,
  UsersIcon,
  MoreHorizontalIcon,
  CheckIcon
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface Role {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  permissions: Array<{
    id: number;
    name: string;
    description: string;
  }>;
  userCount?: number;
}

interface Permission {
  id: number;
  name: string;
  description: string;
}

export default function AdminRolesPage() {
  const { user } = useSession();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await api.get('/roles');
      setRoles(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await api.get('/permissions');
      setPermissions(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load permissions');
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api.post('/roles', {
        name: formData.name,
        description: formData.description,
      });

      toast.success('Role created successfully');
      setCreateDialogOpen(false);
      resetForm();
      fetchRoles();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create role');
    }
  };

  const handleEditRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    try {
      await api.put(`/roles/${selectedRole.id}`, {
        name: formData.name,
        description: formData.description,
      });

      toast.success('Role updated successfully');
      setEditDialogOpen(false);
      setSelectedRole(null);
      resetForm();
      fetchRoles();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update role');
    }
  };

  const handleDeleteRole = async (roleId: number) => {
    if (!confirm('Are you sure you want to delete this role?')) return;

    try {
      await api.delete(`/roles/${roleId}`);
      setRoles(roles.filter(r => r.id !== roleId));
      toast.success('Role deleted successfully');
    } catch (error) {
      toast.error('Failed to delete role');
    }
  };

  const handleUpdatePermissions = async () => {
    if (!selectedRole) return;

    try {
      await api.put(`/roles/${selectedRole.id}/permissions`, {
        permissionIds: selectedPermissions,
      });

      toast.success('Role permissions updated successfully');
      setPermissionsDialogOpen(false);
      setSelectedRole(null);
      setSelectedPermissions([]);
      fetchRoles();
    } catch (error) {
      toast.error('Failed to update permissions');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
    });
  };

  const openEditDialog = (role: Role) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      description: role.description,
    });
    setEditDialogOpen(true);
  };

  const openPermissionsDialog = (role: Role) => {
    setSelectedRole(role);
    setSelectedPermissions(role.permissions.map(p => p.id));
    setPermissionsDialogOpen(true);
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Role Management</h1>
          <p className="text-zinc-400 mt-1">
            Manage roles and their permissions
          </p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <ShieldPlusIcon className="h-4 w-4" />
          Create Role
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-zinc-900/50 border-zinc-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">
              Total Roles
            </CardTitle>
            <ShieldIcon className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{roles.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">
              Total Permissions
            </CardTitle>
            <CheckIcon className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{permissions.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">
              System Roles
            </CardTitle>
            <ShieldIcon className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {roles.filter(r => r.permissions.length > 0).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Roles Table */}
      <Card className="bg-zinc-900/50 border-zinc-700/50">
        <CardHeader>
          <CardTitle className="text-white">Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-zinc-300">Role</TableHead>
                <TableHead className="text-zinc-300">Permissions</TableHead>
                <TableHead className="text-zinc-300">Users</TableHead>
                <TableHead className="text-zinc-300">Created</TableHead>
                <TableHead className="text-zinc-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>
                    <div>
                      <p className="text-white font-medium">{role.name}</p>
                      <p className="text-zinc-400 text-sm">{role.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 3).map((permission) => (
                        <Badge key={permission.id} variant="secondary" className="text-xs">
                          {permission.name}
                        </Badge>
                      ))}
                      {role.permissions.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{role.permissions.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-zinc-400">
                      <UsersIcon className="h-4 w-4" />
                      <span>{role.userCount || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-400">
                    {formatDate(role.createdAt)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontalIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(role)}>
                          <EditIcon className="h-4 w-4 mr-2" />
                          Edit Role
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openPermissionsDialog(role)}>
                          <ShieldIcon className="h-4 w-4 mr-2" />
                          Manage Permissions
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteRole(role.id)}>
                          <TrashIcon className="h-4 w-4 mr-2" />
                          Delete Role
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

      {/* Create Role Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-zinc-900 border-zinc-700">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Role</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Add a new role to the system
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateRole}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-zinc-300">Role Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="bg-zinc-800 border-zinc-600"
                  placeholder="e.g., Manager, Editor"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description" className="text-zinc-300">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="bg-zinc-800 border-zinc-600"
                  placeholder="Describe the role's purpose"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Role</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-zinc-900 border-zinc-700">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Role</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Update role information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditRole}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name" className="text-zinc-300">Role Name</Label>
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
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Role</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Permissions Dialog */}
      <Dialog open={permissionsDialogOpen} onOpenChange={setPermissionsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-zinc-900 border-zinc-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              Manage Permissions - {selectedRole?.name}
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Select permissions for this role
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-96 overflow-y-auto">
            {permissions.map((permission) => (
              <div key={permission.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`permission-${permission.id}`}
                  checked={selectedPermissions.includes(permission.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedPermissions([...selectedPermissions, permission.id]);
                    } else {
                      setSelectedPermissions(selectedPermissions.filter(id => id !== permission.id));
                    }
                  }}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor={`permission-${permission.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white"
                  >
                    {permission.name}
                  </Label>
                  <p className="text-xs text-zinc-400">
                    {permission.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setPermissionsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePermissions}>
              Update Permissions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
