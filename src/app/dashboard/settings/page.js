'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getAuthHeaders } from '@/lib/auth';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { Trash2, Briefcase, Users, AlertTriangle, User } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';

export default function SettingsPage() {
  const { user, isAdmin } = useAuth();
  const { workspaces, fetchWorkspaces, deleteWorkspace } = useWorkspace();
  const [loading, setLoading] = useState(false);
  const [deletingWorkspaceId, setDeletingWorkspaceId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState(null);
  const [systemUsers, setSystemUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [deleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    if (isAdmin) {
      fetchWorkspaces();
      fetchSystemUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const fetchSystemUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await axios.get('/api/users', getAuthHeaders());
      if (response.data.success) {
        setSystemUsers(response.data.users);
      } else {
        toast.error(response.data.error || 'Failed to load users');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  };

  const handleDeleteClick = (workspace) => {
    setWorkspaceToDelete(workspace);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!workspaceToDelete) return;

    try {
      setLoading(true);
      setDeletingWorkspaceId(workspaceToDelete._id);
      
      const result = await deleteWorkspace(workspaceToDelete._id);

      if (result.success) {
        setDeleteDialogOpen(false);
        setWorkspaceToDelete(null);
        // Refresh workspaces list
        await fetchWorkspaces();
      }
    } catch (error) {
      toast.error('Failed to delete workspace');
    } finally {
      setLoading(false);
      setDeletingWorkspaceId(null);
    }
  };

  const handleDeleteUserClick = (targetUser) => {
    setUserToDelete(targetUser);
    setDeleteUserDialogOpen(true);
  };

  const handleDeleteUserConfirm = async () => {
    if (!userToDelete || !isAdmin) return;

    const targetUserId = userToDelete.id || userToDelete._id;

    if (!targetUserId) {
      toast.error('Invalid user information');
      return;
    }

    // Prevent deleting yourself
    if (targetUserId === (user?.id || user?._id)) {
      toast.error('You cannot delete your own account');
      setDeleteUserDialogOpen(false);
      setUserToDelete(null);
      return;
    }

    try {
      setLoading(true);
      setDeletingUserId(targetUserId);
      
      const response = await axios.delete(
        `/api/users/${targetUserId}`,
        getAuthHeaders()
      );

      if (response.data.success) {
        toast.success('User deleted successfully');
        setDeleteUserDialogOpen(false);
        setUserToDelete(null);
        // Refresh users list
        await fetchSystemUsers();
        // Refresh workspaces list as well since user might have been removed from workspaces
        await fetchWorkspaces();
      } else {
        toast.error(response.data.error || 'Failed to delete user');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete user');
    } finally {
      setLoading(false);
      setDeletingUserId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            {isAdmin ? 'Manage workspaces and account settings' : 'Manage your account settings and preferences'}
          </p>
        </div>

        {/* Profile Details - Show for all users */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
            <CardDescription>
              Your personal information and account details
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-lg">{user.name}</p>
                      <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>
                        {user.role === 'admin' ? 'Admin' : user.role === 'member' ? 'Member' : 'Viewer'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                    <p className="text-sm mt-1">{user.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="text-sm mt-1">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Role</p>
                    <p className="text-sm mt-1 capitalize">{user.role}</p>
                  </div>
                  {user.id && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">User ID</p>
                      <p className="text-sm mt-1 font-mono text-xs">{user.id}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Loading profile information...</p>
            )}
          </CardContent>
        </Card>

        {/* Workspace Details - Show only for admins */}
        {isAdmin && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Workspaces</CardTitle>
                <CardDescription>
                  Manage all workspaces. Deleting a workspace will permanently remove it and all associated projects and tasks.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {workspaces.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No workspaces found.</p>
                ) : (
                  <div className="space-y-3">
                    {workspaces.map((workspace) => (
                      <div
                        key={workspace._id}
                        className="flex items-center justify-between rounded-lg border border-border p-4"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                            <Briefcase className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{workspace.name}</p>
                              {workspace.owner && (
                                <Badge variant="outline" className="text-xs">
                                  Owner: {typeof workspace.owner === 'object' ? workspace.owner.name : 'Unknown'}
                                </Badge>
                              )}
                            </div>
                            {workspace.description && (
                              <p className="text-sm text-muted-foreground mt-1">{workspace.description}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Users className="h-3 w-3" />
                                <span>
                                  {workspace.members?.length || 0} member{workspace.members?.length !== 1 ? 's' : ''}
                                </span>
                              </div>
                              {workspace.createdAt && (
                                <p className="text-xs text-muted-foreground">
                                  Created {format(new Date(workspace.createdAt), 'dd MMM yyyy')}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="ml-4 text-destructive hover:text-destructive hover:bg-destructive/10"
                          disabled={deletingWorkspaceId === workspace._id || loading}
                          onClick={() => handleDeleteClick(workspace)}
                        >
                          {deletingWorkspaceId === workspace._id ? (
                            'Deleting...'
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Workspace Members - Show only for admins */}
            <Card>
              <CardHeader>
                <CardTitle>Workspace Members</CardTitle>
                <CardDescription>
                  View all members in each workspace with their details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {workspaces.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No workspaces found.</p>
                ) : (
                  <div className="space-y-6">
                    {workspaces.map((workspace) => {
                      const members = workspace.members || [];
                      const ownerId = typeof workspace.owner === 'object' && workspace.owner !== null && '_id' in workspace.owner
                        ? workspace.owner._id.toString()
                        : workspace.owner?.toString();

                      return (
                        <div key={workspace._id} className="space-y-3">
                          <div className="flex items-center gap-2 pb-2 border-b">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                            <p className="font-medium">{workspace.name}</p>
                            <Badge variant="secondary" className="text-xs">
                              {members.length} member{members.length !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                          {members.length === 0 ? (
                            <p className="text-sm text-muted-foreground pl-6">No members in this workspace.</p>
                          ) : (
                            <div className="space-y-2 pl-6">
                              {members.map((member, index) => {
                                const memberUser = typeof member.user === 'object' && member.user !== null
                                  ? member.user
                                  : null;
                                const memberUserId = memberUser && '_id' in memberUser
                                  ? memberUser._id.toString()
                                  : member.user?.toString();
                                const isOwner = memberUserId === ownerId;
                                const memberName = memberUser?.name || 'Unknown User';
                                const memberEmail = memberUser?.email || 'No email';

                                return (
                                  <div
                                    key={memberUserId || `member-${workspace._id}-${index}`}
                                    className="flex items-center justify-between rounded-lg border border-border p-3"
                                  >
                                    <div className="flex items-center gap-3 flex-1">
                                      <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg">
                                        <User className="h-4 w-4 text-primary" />
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <p className="font-medium text-sm">{memberName}</p>
                                          {isOwner && (
                                            <Badge variant="default" className="text-xs">
                                              Owner
                                            </Badge>
                                          )}
                                          {!isOwner && member.role && (
                                            <Badge variant="outline" className="text-xs capitalize">
                                              {member.role}
                                            </Badge>
                                          )}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-0.5">{memberEmail}</p>
                                        {member.joinedAt && (
                                          <p className="text-xs text-muted-foreground mt-1">
                                            Joined {format(new Date(member.joinedAt), 'dd MMM yyyy')}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* System Users - Show only for admins */}
            <Card>
              <CardHeader>
                <CardTitle>System Users</CardTitle>
                <CardDescription>
                  Manage all users who have signed up for the task management system. Only admins can delete users.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <p className="text-sm text-muted-foreground">Loading users...</p>
                ) : systemUsers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No users found.</p>
                ) : (
                  <div className="space-y-3">
                    {systemUsers.map((systemUser) => {
                      const userId = systemUser.id || systemUser._id;
                      const isCurrentUser = userId === (user?.id || user?._id);
                      const isAdminUser = systemUser.role === 'admin';

                      return (
                        <div
                          key={userId}
                          className="flex items-center justify-between rounded-lg border border-border p-4"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{systemUser.name}</p>
                                <Badge variant={isAdminUser ? 'default' : 'outline'} className="text-xs capitalize">
                                  {systemUser.role}
                                </Badge>
                                {isCurrentUser && (
                                  <Badge variant="secondary" className="text-xs">
                                    You
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{systemUser.email}</p>
                              {systemUser.createdAt && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Joined {format(new Date(systemUser.createdAt), 'dd MMM yyyy')}
                                </p>
                              )}
                            </div>
                          </div>
                          {!isCurrentUser && !isAdminUser && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="ml-4 text-destructive hover:text-destructive hover:bg-destructive/10"
                              disabled={deletingUserId === userId || loading}
                              onClick={() => handleDeleteUserClick(systemUser)}
                            >
                              {deletingUserId === userId ? (
                                'Deleting...'
                              ) : (
                                <>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </>
                              )}
                            </Button>
                          )}
                          {isAdminUser && !isCurrentUser && (
                            <p className="text-xs text-muted-foreground ml-4">Cannot delete admin</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Delete Workspace
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete <strong>{workspaceToDelete?.name}</strong>? This action cannot be undone.
                All projects and tasks in this workspace will be permanently deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={loading}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={deleteUserDialogOpen} onOpenChange={setDeleteUserDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Delete User
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete <strong>{userToDelete?.name}</strong> ({userToDelete?.email})? 
                This action cannot be undone. All their workspaces, projects, and tasks will be deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteUserConfirm}
                disabled={loading}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}

