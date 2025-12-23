'use client';

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getAuthHeaders } from '@/lib/auth';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useAuth } from '@/context/AuthContext';
import { Trash2 } from 'lucide-react';

export default function TeamPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assigningUserId, setAssigningUserId] = useState(null);
  const [removingUserId, setRemovingUserId] = useState(null);
  const { currentWorkspace, fetchWorkspaces } = useWorkspace();
  const { isAdmin, user: currentUser } = useAuth();

  const memberIds = useMemo(() => {
    if (!currentWorkspace?.members) return new Set();
    return new Set(
      currentWorkspace.members.map((member) => {
        if (!member.user) return null;
        if (typeof member.user === 'object' && '_id' in member.user) {
          return member.user._id?.toString();
        }
        return member.user?.toString();
      })
    );
  }, [currentWorkspace]);

  const isUserInWorkspace = (userId) => memberIds.has(userId);

  useEffect(() => {
    let isMounted = true;

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/users', getAuthHeaders());
        if (!isMounted) return;

        if (response.data.success) {
          setUsers(response.data.users);
        } else {
          toast.error(response.data.error || 'Failed to load users');
        }
      } catch (error) {
        if (isMounted) {
          toast.error(error.response?.data?.error || 'Failed to load users');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddToWorkspace = async (targetUserId) => {
    if (!isAdmin) {
      toast.error('Only admins can manage workspace members.');
      return;
    }

    if (!currentWorkspace?._id) {
      toast.error('Select a workspace before adding members.');
      return;
    }

    if (isUserInWorkspace(targetUserId)) {
      toast.info('User is already part of this workspace.');
      return;
    }

    try {
      setAssigningUserId(targetUserId);
      const response = await axios.post(
        `/api/workspaces/${currentWorkspace._id}/members`,
        { targetUserId },
        getAuthHeaders()
      );

      if (response.data.success) {
        toast.success('User added to workspace');
        await fetchWorkspaces();
      } else {
        toast.error(response.data.error || 'Failed to add user to workspace');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add user to workspace');
    } finally {
      setAssigningUserId(null);
    }
  };

  const handleRemoveFromWorkspace = async (targetUserId) => {
    if (!isAdmin) {
      toast.error('Only admins can manage workspace members.');
      return;
    }

    if (!currentWorkspace?._id) {
      toast.error('Select a workspace before removing members.');
      return;
    }

    if (!isUserInWorkspace(targetUserId)) {
      toast.info('User is not part of this workspace.');
      return;
    }

    try {
      setRemovingUserId(targetUserId);
      const response = await axios.delete(
        `/api/workspaces/${currentWorkspace._id}/members/${targetUserId}`,
        getAuthHeaders()
      );

      if (response.data.success) {
        toast.success('User removed from workspace');
        await fetchWorkspaces();
      } else {
        toast.error(response.data.error || 'Failed to remove user from workspace');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to remove user from workspace');
    } finally {
      setRemovingUserId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team</h1>
          <p className="text-muted-foreground">
            Browse all users and grant access to the currently selected workspace.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              {isAdmin
                ? currentWorkspace
                  ? `Add teammates to ${currentWorkspace.name} so they can access its projects.`
                  : 'Select a workspace from the sidebar to start assigning members.'
                : 'Only admins can modify workspace memberships.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading users…</p>
            ) : users.length === 0 ? (
              <p className="text-sm text-muted-foreground">No users found.</p>
            ) : (
              <div className="space-y-3">
                {users.map((user) => {
                  const alreadyInWorkspace = currentWorkspace && isUserInWorkspace(user.id);
                  const isSelf = currentUser?.id === user.id || currentUser?._id === user.id;

                  return (
                    <div
                      key={user.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3"
                    >
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={user.role === 'admin' ? 'default' : 'secondary'}
                          className="capitalize"
                        >
                          {user.role}
                        </Badge>
                        {user.createdAt && (
                          <p className="text-xs text-muted-foreground hidden sm:block">
                            Joined {format(new Date(user.createdAt), 'dd MMM yyyy')}
                          </p>
                        )}
                        {isAdmin && currentWorkspace && (
                          alreadyInWorkspace ? (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={removingUserId === user.id || isSelf}
                              onClick={() => handleRemoveFromWorkspace(user.id)}
                            >
                              {removingUserId === user.id ? (
                                'Removing...'
                              ) : (
                                <>
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Remove
                                </>
                              )}
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="default"
                              disabled={assigningUserId === user.id || isSelf}
                              onClick={() => handleAddToWorkspace(user.id)}
                            >
                              {assigningUserId === user.id ? 'Adding...' : 'Add to workspace'}
                            </Button>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}