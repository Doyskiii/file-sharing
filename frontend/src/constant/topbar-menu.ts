import { LucideProps, FolderIcon, ZapIcon, ClipboardClockIcon } from "lucide-react"
import { ForwardRefExoticComponent, RefAttributes } from "react"

interface TopbarMenuType {
    name: string
    href: string
    icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>
}

export const TOPBAR_MENU: TopbarMenuType[] = [
    {
        name: 'files',
        href: '/files/all-files',
        icon: FolderIcon

    },
    {
        name: 'activity',
        href: '/activity/all-activities',
        icon: ClipboardClockIcon
    },
]