import { Calendar1Icon, ClipboardClockIcon, ContactIcon, FolderClockIcon, FolderGit2Icon, FolderHeartIcon, FolderIcon, FolderKeyIcon, FolderLockIcon, FolderSyncIcon, FoldersIcon, Image, ListCheckIcon, LucideProps, MessageSquareTextIcon, TagsIcon, Trash2Icon, UserRoundIcon, UserRoundPlusIcon, UserRoundSearchIcon, UsersRoundIcon, Users, Zap } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";

interface MenuItem {
  title: string;
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>
  href?: string;
  sub_menu?: string[]
}

export const MAIN_MENU = {
  DASHBOARD: 'dashboard',
  FILES: 'files',
  ACTIVITY: 'activity'
}

export const SIDEBAR_MENU: Record<(typeof MAIN_MENU)[keyof typeof MAIN_MENU], MenuItem[]> = {
  [MAIN_MENU.DASHBOARD]: [
    { title: 'overview', icon: FolderIcon, href: '/dashboard' },
    { title: 'files', icon: FolderIcon, href: '/files/all-files' },
    { title: 'gallery', icon: Image, href: '/files/gallery' },
    { title: 'activity', icon: Zap, href: '/activity/all-activities' },
    { title: 'contacts', icon: Users, href: '/contacts' },
  ],
  [MAIN_MENU.FILES]: [
    { title: 'all-files', icon: FolderIcon },
    { title: 'personal-files', icon: FolderLockIcon },
    { title: 'recent', icon: FolderClockIcon },
    { title: 'favorite', icon: FolderHeartIcon },
    { title: 'all-folders', icon: FoldersIcon },
    { title: 'shared', icon: UserRoundPlusIcon, sub_menu: ['overview', 'with-me', 'with-others', 'by-link', 'file-request', 'deleted', 'pending'] },
    { title: 'tags', icon: TagsIcon },
    { title: 'external-storage', icon: FolderGit2Icon },
    { title: 'deleted-files', icon: Trash2Icon },
  ],
  [MAIN_MENU.ACTIVITY]: [
    { title: 'all-activities', icon: ClipboardClockIcon },
    { title: 'by-me', icon: UserRoundIcon },
    { title: 'by-others', icon: UserRoundSearchIcon },
    { title: 'teams', icon: UsersRoundIcon },
    { title: 'favorites', icon: FolderHeartIcon },
    { title: 'file-changes', icon: FolderSyncIcon },
    { title: 'security', icon: FolderLockIcon },
    { title: 'file-shares', icon: UserRoundPlusIcon },
    { title: 'calendar', icon: Calendar1Icon },
    { title: 'tasks', icon: ListCheckIcon },
    { title: 'comments', icon: MessageSquareTextIcon },
    { title: 'contacts', icon: ContactIcon },
  ]
}

