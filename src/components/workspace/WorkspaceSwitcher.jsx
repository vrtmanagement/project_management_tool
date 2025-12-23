'use client';

import { useEffect } from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Check, ChevronsUpDown, Plus, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CreateWorkspaceDialog } from './CreateWorkspaceDialog';

export function WorkspaceSwitcher() {
  const { workspaces, currentWorkspace, switchWorkspace, fetchWorkspaces } = useWorkspace();

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  if (!currentWorkspace) {
    return (
      <div className="flex items-center gap-2 px-2">
        <CreateWorkspaceDialog />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-[200px] justify-between"
          >
            <div className="flex items-center gap-2 truncate">
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                  {currentWorkspace.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{currentWorkspace.name}</span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[200px]" align="start">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Workspaces
          </DropdownMenuLabel>
          {workspaces.map((workspace) => (
            <DropdownMenuItem
              key={workspace._id}
              onSelect={() => {
                if (workspace._id !== currentWorkspace._id) {
                  switchWorkspace(workspace);
                }
              }}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-2 flex-1">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-xs">
                    {workspace.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">{workspace.name}</span>
              </div>
              {workspace._id === currentWorkspace._id && (
                <Check className="h-4 w-4 ml-2" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="self-start">
        <CreateWorkspaceDialog />
      </div>
    </div>
  );
}

