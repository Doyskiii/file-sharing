"use client"

import { SIDEBAR_MENU, MAIN_MENU } from '@/constant/sidebar-menu';
import { cn } from '@/lib/utils';
import { ChevronDownIcon, PanelLeftIcon, PanelLeftCloseIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Button } from '../ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { Input } from '../ui/input';

export default function Sidebar() {

    const path = usePathname()
    const [open, setOpen] = useState<boolean>(false)
    const [isCollapsed, setIsCollapsed] = useState<boolean>(false)

    // Always use dashboard menu for consistent navigation
    const menus = SIDEBAR_MENU[MAIN_MENU.DASHBOARD]

    const segments = path.split('/').filter(Boolean)
    const mainSection = segments[0]
    const activeSubmenu = segments[1]

    // Determine which menu item should be active
    let activeItem = ''
    if (path === '/dashboard') activeItem = 'overview'
    else if (path.startsWith('/files/all-files') || path.startsWith('/files/all-folders') || path.startsWith('/files/shared')) activeItem = 'files'
    else if (path.startsWith('/files/gallery')) activeItem = 'gallery'
    else if (path.startsWith('/activity')) activeItem = 'activity'
    else if (path.startsWith('/contacts')) activeItem = 'contacts'

    return (
        <aside className={cn(
            "p-3 space-y-2 dark:bg-zinc-900/95 backdrop-blur-sm border-r border-zinc-700/50 duration-300 ease-in-out shadow-xl select-none",
            isCollapsed ? "w-[60px]" : "w-[300px]",
            "relative"
        )}>
            {/* Toggle Button - Only show on desktop */}
            <div className='hidden lg:block absolute top-4 -right-12 cursor-pointer opacity-70 hover:opacity-100 hover:scale-110 duration-200 p-2 rounded-full bg-zinc-800/80 hover:bg-zinc-700/90 transition-all z-20 shadow-lg border border-zinc-600/50' onClick={() => setIsCollapsed(prev => !prev)}>
                {isCollapsed ? <PanelLeftIcon className="w-5 h-5 text-zinc-300" /> : <PanelLeftCloseIcon className="w-5 h-5 text-zinc-300" />}
            </div>

            {/* Mobile Toggle (existing) */}
            <div className='lg:hidden absolute top-4 -right-10 cursor-pointer opacity-70 hover:opacity-100 hover:scale-110 duration-200 p-1 rounded-full bg-zinc-800/50 hover:bg-zinc-700/70 transition-all' onClick={() => setOpen(prev => !prev)}>
                <PanelLeftIcon className="w-5 h-5" />
            </div>

            {/* Search Input - only show when not collapsed */}
            {
                mainSection === 'files' && !isCollapsed && <Input placeholder='Search File' className='mb-3' />
            }

            {menus.map(menu => {
                const isActive = activeItem === menu.title

                if (menu?.sub_menu) {
                    return (
                        <Collapsible key={menu.title}>
                            <CollapsibleTrigger asChild className='group'>
                                <Button
                                    variant={'ghost'}
                                    className={cn(
                                        'flex items-center w-full gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-zinc-800/50 hover:scale-[1.02] justify-start text-zinc-300 hover:text-white',
                                        isCollapsed && 'justify-center px-2'
                                    )}
                                >
                                    <menu.icon className="w-5 h-5 flex-shrink-0" />
                                    {!isCollapsed && (
                                        <>
                                            <span className="font-medium text-left flex-1">{menu.title.replace(/-/g, ' ')}</span>
                                            <ChevronDownIcon className='w-4 h-4 group-data-[state=open]:-rotate-180 duration-300 transition-transform flex-shrink-0' />
                                        </>
                                    )}
                                </Button>
                            </CollapsibleTrigger>
                            {!isCollapsed && (
                                <CollapsibleContent className='mx-4 my-2 p-2 dark:bg-zinc-800/30 rounded-lg border border-zinc-700/30 backdrop-blur-sm animate-in slide-in-from-top-2 duration-300'>
                                    {menu.sub_menu.map(submenu => {

                                        const isActiveSub = activeSubmenu === `${menu.title}-${submenu}`

                                        return (
                                            <Button
                                                key={submenu}
                                                variant={'ghost'}
                                                asChild
                                                className={cn(
                                                    'w-full justify-start gap-3 p-2 rounded-md transition-all duration-200 hover:bg-zinc-700/50 hover:scale-[1.01] text-left text-zinc-400 hover:text-zinc-200'
                                                )}
                                            >
                                                <Link
                                                    key={submenu}
                                                    href={`/${mainSection}/${menu.title}-${submenu}`}
                                                    className="flex items-center gap-3 w-full"
                                                >
                                                    <div className="w-2 h-2 rounded-full bg-zinc-500 flex-shrink-0"></div>
                                                    <span className="text-left">{submenu.replace(/-/g, ' ')}</span>
                                                </Link>
                                            </Button>
                                        )
                                    })}
                                </CollapsibleContent>
                            )}
                        </Collapsible>
                    )
                }

                return (
                    <Button
                        key={menu.title}
                        variant={'ghost'}
                        asChild
                        className={cn(
                            'flex items-center w-full gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-zinc-800/50 hover:scale-[1.02] justify-start text-zinc-300 hover:text-white',
                            isCollapsed && 'justify-center px-2'
                        )}
                    >
                        <Link
                            key={menu.title}
                            href={menu.href || `/${mainSection}/${menu.title}`}
                            className="flex items-center gap-3 w-full"
                        >
                            <menu.icon className="w-5 h-5 flex-shrink-0" />
                            {!isCollapsed && (
                                <span className="font-medium text-left flex-1">{menu.title.replace(/-/g, ' ')}</span>
                            )}
                        </Link>
                    </Button>

                )
            })}
        </aside>
    )
}
