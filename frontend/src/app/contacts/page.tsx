'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserIcon, MailIcon, PhoneIcon, MessageSquareIcon } from 'lucide-react';

export default function ContactsPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Contacts</h1>
        <p className="text-zinc-400 mt-1">
          Manage your contacts and connections
        </p>
      </div>

      {/* Coming Soon Message */}
      <Card className="bg-zinc-900/50 border-zinc-700/50">
        <CardContent className="p-8 text-center">
          <UserIcon className="h-16 w-16 text-zinc-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Contacts Feature</h2>
          <p className="text-zinc-400 mb-4">
            Contact management and user connections will be available soon.
          </p>
          <p className="text-zinc-500 text-sm">
            This feature will allow you to organize and manage your professional contacts within the file-sharing platform.
          </p>
        </CardContent>
      </Card>

      {/* Placeholder Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-zinc-900/50 border-zinc-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <MailIcon className="h-5 w-5" />
              Email Integration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-400 text-sm">
              Connect your email contacts for easy file sharing.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <PhoneIcon className="h-5 w-5" />
              Phone Contacts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-400 text-sm">
              Import and sync phone contacts for collaboration.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <MessageSquareIcon className="h-5 w-5" />
              Team Groups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-400 text-sm">
              Create and manage contact groups for team collaboration.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}