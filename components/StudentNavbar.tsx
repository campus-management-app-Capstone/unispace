"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import {
  BookOpen,
  Users,
  GraduationCap,
  Building2,
  ClipboardList,
  Megaphone,
  List,
  Building,
  BookText,
  FileText,
  School,
  Menu,
  ChevronDown,
  Blocks,
  UsersRound,
  Calendar,
  ChartBar,
  Wallet,
  Car,
  MapPin,
  HelpCircle,
  BarChart,
} from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";



/** Top-level admin navigation items (direct links without sub-menus) */
const studentNavItems = [
  { 
    label: "Home", 
    href: "/home", 
    icon: Users, 
  },
  { 
    label: "Timetable", 
    href: "/student/timetable", 
    icon: Calendar, 
  },
  { 
    label: "Attendance", 
    href: "/student/attendance", 
    icon: GraduationCap, 
  },
  { 
    label: "Wallet", 
    href: "/wallet", 
    icon: Wallet, 
  },
  { 
    label: "Map", 
    href: "/map", 
    icon: MapPin, 
  },
  { 
    label: "Parking", 
    href: "/parking", 
    icon: Car, 
  },
  {
    label: "Facility",
    href: "/facility",
    icon: School
  },
  {
    label: "Survey",
    href: "/survey",
    icon: FileText
  },
  { 
    label: "Announcement", 
    href: "/announcement", 
    icon: Megaphone, 
  },
  { 
    label: "Analytics", 
    href: "/student/analytics", 
    icon: BarChart, 
  },
  {
    label: "Help Centre",
    href: "/help",
    icon: HelpCircle,
  }
] as const;

/**
 * Admin navbar with dropdown menus and a right-side sidebar.
 * pc view : shadcn navbar with dropdown for Course sub-items.
 * mobile view + hamburger menu: Sheet slides in from the right with full navigation.
 */
export default function AdminNavbar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  /** Check if a given href link is active */
  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 bg-background border-b">
      <nav className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/admin" className="shrink-0">
          <Image src="/favicon.ico" alt="UniSpace" width={40} height={40} />
        </Link>

        {/* Desktop navigation stays visible on laptop and larger screens */}
        <NavigationMenu className="hidden lg:flex">
          <NavigationMenuList>
            

            {/* link to admin page */}
            {studentNavItems.map(({ label, href, icon: Icon }) => (
              <NavigationMenuItem key={href}>
                <Link
                  href={href}
                  className={cn(
                    navigationMenuTriggerStyle(),
                    isActive(href) && "bg-accent text-accent-foreground"
                  )}
                >
                  <Icon className="mr-1.5 size-4" />
                  {label}
                </Link>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Hamburger menu is only shown on tablet and phone widths */}
        <div className="flex items-center gap-2">
          <Button
            className="lg:hidden"
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation sidebar"
          >
            <Menu className="size-5" />
          </Button>
          <UserButton />
        </div>
      </nav>

      {/* hamburger menu */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="right" className="w-72 p-0">
          <SheetHeader className="p-4 pb-2">
            <SheetTitle className="text-lg font-semibold">Navigation</SheetTitle>
          </SheetHeader>
          <Separator />

          <div className="flex flex-col gap-1 overflow-y-auto p-3">
            {/* admin page link */}
            <Link
              href="/admin"
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                pathname === "/admin" && "bg-accent/60 font-medium"
              )}
            >
              <BookOpen className="size-4 text-muted-foreground" />
              Dashboard
            </Link>

            <Separator className="my-1" />

            {/* Course group — collapsible */}
            <Collapsible defaultOpen={isActive("/course")}>
              <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
                <span className="flex items-center gap-2">
                  <BookOpen className="size-4" />
                  Course
                </span>
                <ChevronDown className="size-4 transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="ml-4 mt-1 flex flex-col gap-0.5 border-l pl-3">
                  
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Separator className="my-1" />

            {/* link to admin page */}
            {studentNavItems.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                  isActive(href) && "bg-accent/60 font-medium"
                )}
              >
                <Icon className="size-4 text-muted-foreground" />
                {label}
              </Link>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
