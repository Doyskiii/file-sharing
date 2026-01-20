'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserIcon, LinkIcon, CalendarIcon } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

interface User {
  id: number;
  username: string;
  email: string;
}

interface ShareFileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileId: number;
  fileName: string;
  onShareCreated?: () => void;
}

export function ShareFileDialog({
  open,
  onOpenChange,
  fileId,
  fileName,
  onShareCreated
}: ShareFileDialogProps) {
  const [activeTab, setActiveTab] = useState<'private' | 'public'>('private');
  const [loading, setLoading] = useState(false);

  // Private share state
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [privateAccessType, setPrivateAccessType] = useState<'view' | 'download' | 'edit'>('view');
  const [privateMessage, setPrivateMessage] = useState('');

  // Public share state
  const [publicAccessType, setPublicAccessType] = useState<'view' | 'download'>('view');
  const [expiresIn, setExpiresIn] = useState<string>('7'); // days
  const [publicMessage, setPublicMessage] = useState('');
  const [requirePassword, setRequirePassword] = useState(false);
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (open && activeTab === 'private') {
      fetchUsers();
    }
  }, [open, activeTab]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      // Filter out current user
      const currentUserId = JSON.parse(localStorage.getItem('user') || '{}').id;
      const filteredUsers = response.data.data.filter((user: User) => user.id !== currentUserId);
      setUsers(filteredUsers);
    } catch (error) {
      toast.error('Failed to load users');
    }
  };

  const handlePrivateShare = async () => {
    if (!selectedUserId) {
      toast.error('Please select a user to share with');
      return;
    }

    setLoading(true);
    try {
      await api.post('/shares/private', {
        fileId,
        sharedWithUserId: parseInt(selectedUserId),
        accessType: privateAccessType,
        message: privateMessage || undefined,
      });

      toast.success('File shared successfully!');
      onOpenChange(false);
      onShareCreated?.();

      // Reset form
      setSelectedUserId('');
      setPrivateAccessType('view');
      setPrivateMessage('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to share file');
    } finally {
      setLoading(false);
    }
  };

  const handlePublicShare = async () => {
    setLoading(true);
    try {
      const expiresAt = expiresIn ? new Date(Date.now() + parseInt(expiresIn) * 24 * 60 * 60 * 1000).toISOString() : null;

      const response = await api.post('/shares/public', {
        fileId,
        accessType: publicAccessType,
        expiresAt,
        password: requirePassword ? password : undefined,
        message: publicMessage || undefined,
      });

      const shareUrl = `${window.location.origin}/share/${response.data.data.token}`;

      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Public link created and copied to clipboard!');

      onOpenChange(false);
      onShareCreated?.();

      // Reset form
      setPublicAccessType('view');
      setExpiresIn('7');
      setPublicMessage('');
      setRequirePassword(false);
      setPassword('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create public link');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedUserId('');
    setPrivateAccessType('view');
    setPrivateMessage('');
    setPublicAccessType('view');
    setExpiresIn('7');
    setPublicMessage('');
    setRequirePassword(false);
    setPassword('');
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-zinc-900 border-zinc-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Share "{fileName}"
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Choose how you want to share this file
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'private' | 'public')}>
          <TabsList className="grid w-full grid-cols-2 bg-zinc-800">
            <TabsTrigger value="private" className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              Private Share
            </TabsTrigger>
            <TabsTrigger value="public" className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              Public Link
            </TabsTrigger>
          </TabsList>

          <TabsContent value="private" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="user-select" className="text-zinc-300">Share with user</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger className="bg-zinc-800 border-zinc-600">
                  <SelectValue placeholder="Select a user..." />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-600">
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.username} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Access level</Label>
              <Select value={privateAccessType} onValueChange={(value: 'view' | 'download' | 'edit') => setPrivateAccessType(value)}>
                <SelectTrigger className="bg-zinc-800 border-zinc-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-600">
                  <SelectItem value="view">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">View</Badge>
                      <span>Can only view the file</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="download">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">Download</Badge>
                      <span>Can view and download</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="edit">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">Edit</Badge>
                      <span>Full access (view, download, edit)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="private-message" className="text-zinc-300">Message (optional)</Label>
              <Textarea
                id="private-message"
                placeholder="Add a message with your share..."
                value={privateMessage}
                onChange={(e) => setPrivateMessage(e.target.value)}
                className="bg-zinc-800 border-zinc-600"
                rows={3}
              />
            </div>
          </TabsContent>

          <TabsContent value="public" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Access level</Label>
              <Select value={publicAccessType} onValueChange={(value: 'view' | 'download') => setPublicAccessType(value)}>
                <SelectTrigger className="bg-zinc-800 border-zinc-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-600">
                  <SelectItem value="view">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">View</Badge>
                      <span>Anyone with link can view</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="download">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">Download</Badge>
                      <span>Anyone with link can download</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expires-in" className="text-zinc-300">Link expires in</Label>
              <Select value={expiresIn} onValueChange={setExpiresIn}>
                <SelectTrigger className="bg-zinc-800 border-zinc-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-600">
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="365">1 year</SelectItem>
                  <SelectItem value="">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="require-password"
                checked={requirePassword}
                onCheckedChange={(checked) => setRequirePassword(checked as boolean)}
              />
              <Label htmlFor="require-password" className="text-zinc-300 text-sm">
                Require password to access
              </Label>
            </div>

            {requirePassword && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-zinc-300">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-zinc-800 border-zinc-600"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="public-message" className="text-zinc-300">Message (optional)</Label>
              <Textarea
                id="public-message"
                placeholder="Add a message for link visitors..."
                value={publicMessage}
                onChange={(e) => setPublicMessage(e.target.value)}
                className="bg-zinc-800 border-zinc-600"
                rows={2}
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={activeTab === 'private' ? handlePrivateShare : handlePublicShare}
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? (
              'Sharing...'
            ) : activeTab === 'private' ? (
              <>
                <UserIcon className="h-4 w-4" />
                Share Privately
              </>
            ) : (
              <>
                <LinkIcon className="h-4 w-4" />
                Create Public Link
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
