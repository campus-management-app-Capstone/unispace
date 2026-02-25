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
  UsersRound 
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

/** Course management sub-navigation items */
const courseSubItems = [
  {
    label: "Course List",
    href: "/admin/course/courselist",
    icon: List,
  },
  { 
    label: "Department", 
    href: "/admin/course/department", 
    icon: Building,  
  },
  { 
    label: "Subject", 
    href: "/admin/course/subject", 
    icon: BookText, 
  },
  { 
    label: "Syllabus", 
    href: "/admin/course/syllabus", 
    icon: FileText, 
  },
  { 
    label: "Class", 
    href: "/admin/course/class", 
    icon: School, 
  },
] as const;

/** Top-level admin navigation items (direct links without sub-menus) */
const adminNavItems = [
  { 
    label: "Student", 
    href: "/admin/student", 
    icon: Users, 
  },
  { 
    label: "Lecturer", 
    href: "/admin/lecturer", 
    icon: GraduationCap, 
  },
  { 
    label: "Facility", 
    href: "/admin/facility", 
    icon: Building2, 
  },
  { 
    label: "Survey", 
    href: "/admin/survey", 
    icon: ClipboardList, 
  },
  { 
    label: "Announcement", 
    href: "/admin/announcement", 
    icon: Megaphone, 
  },
  { 
    label: "Admin", 
    href: "/admin/adminmanagement", 
    icon: UsersRound, 
  },
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

        {/* desktop dropdown navigation menu — hidden on mobile */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {/* course dropdown with sub-items */}
            <NavigationMenuItem>
              <NavigationMenuTrigger
                className={cn(isActive("/course") && "bg-accent text-accent-foreground")}
              >
                <BookOpen className="mr-1.5 size-4" />
                Course
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[420px] gap-1 p-2 md:grid-cols-2">
                  {courseSubItems.map(({ label, href, icon: Icon }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className={cn(
                          "flex select-none items-start gap-3 rounded-md p-3 text-sm no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                          isActive(href) && "bg-accent/60"
                        )}
                      >
                        <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                        <div className="flex flex-col gap-1">
                          <span className="font-medium leading-none">{label}</span>
                          
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* link to admin page */}
            {adminNavItems.map(({ label, href, icon: Icon }) => (
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

        {/* hamburger menu + Clerk user button */}
        <div className="flex items-center gap-2">
          <Button
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
                  {courseSubItems.map(({ label, href, icon: Icon }) => (
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
              </CollapsibleContent>
            </Collapsible>

            <Separator className="my-1" />

            {/* link to admin page */}
            {adminNavItems.map(({ label, href, icon: Icon }) => (
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
