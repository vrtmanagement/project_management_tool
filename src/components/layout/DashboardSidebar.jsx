'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import { WorkspaceSwitcher } from '@/components/workspace/WorkspaceSwitcher';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Settings,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  LogOut,
  BookOpen,
} from 'lucide-react';
import { useState } from 'react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Projects',
    href: '/dashboard/projects',
    icon: FolderKanban,
  },
  {
    name: 'Team',
    href: '/dashboard/team',
    icon: Users,
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

const memberNavigation = [
  {
    name: 'Reflection',
    href: '/dashboard/reflection',
    icon: BookOpen,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMember = user?.role === 'member';

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div
      className={cn(
        'relative flex flex-col h-screen bg-card border-r border-border transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header with Logo */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden">
              <Image
                src="/assets/logo.png"
                alt="Logo"
                width={80}
                height={80}
                className="object-contain w-full h-full"
              />
            </div>
            {/* <span className="font-bold text-lg">VRT</span> */}
          </Link>
        )}
        {isCollapsed && (
          <Link href="/dashboard" className="flex items-center justify-center w-full">
            <div className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-lg overflow-hidden">
              <Image
                src="/assets/logo.png"
                alt="Logo"
                width={56}
                height={56}
                className="object-contain w-full h-full"
              />
            </div>
          </Link>
        )}
      </div>

      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-20 z-50 h-6 w-6 rounded-full border border-border bg-background shadow-md"
        onClick={toggleSidebar}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>

      {/* Workspace Switcher */}
      {!isCollapsed && (
        <div className="px-3 py-2">
          <WorkspaceSwitcher />
        </div>
      )}
      <Separator />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-3',
                    isActive && 'bg-primary/10 text-primary hover:bg-primary/20',
                    isCollapsed && 'justify-center'
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!isCollapsed && <span>{item.name}</span>}
                </Button>
              </Link>
            );
          })}
          {/* Member-only navigation */}
          {/* {isMember && memberNavigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-3',
                    isActive && 'bg-primary/10 text-primary hover:bg-primary/20',
                    isCollapsed && 'justify-center'
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!isCollapsed && <span>{item.name}</span>}
                </Button>
              </Link>
            );
          })} */}
        </nav>
      </ScrollArea>

      {/* My Tasks Section - Bottom */}
      {/* <div className="border-t border-border p-3">
        <Link href="/dashboard/my-tasks">
          <Button
            variant={pathname === '/dashboard/my-tasks' ? 'secondary' : 'ghost'}
            className={cn(
              'w-full justify-start gap-3',
              pathname === '/dashboard/my-tasks' && 'bg-primary/10 text-primary',
              isCollapsed && 'justify-center'
            )}
          >
            <CheckSquare className="h-5 w-5 shrink-0" />
            {!isCollapsed && (
              <div className="flex items-center justify-between w-full">
                <span>My Tasks</span>
                <Badge variant="secondary" className="ml-auto">
                  12
                </Badge>
              </div>
            )}
            {isCollapsed && (
              <Badge
                variant="secondary"
                className="absolute -right-1 -top-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                12
              </Badge>
            )}
          </Button>
        </Link>
      </div> */}

      {/* Logout - Bottom */}
      <div className="border-t border-border p-3">
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start gap-3 h-auto py-2 text-red-600 hover:text-red-700 hover:bg-red-50',
            isCollapsed && 'justify-center px-2'
          )}
          onClick={logout}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  );
}

