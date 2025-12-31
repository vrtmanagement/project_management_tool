'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getAuthHeaders } from '@/lib/auth';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { Mail, ChevronLeft, Calendar, FileText, Search, User, Eye, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';

export default function AdminReflectionsPage() {
  const { isAdmin, user: currentUser } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [reflections, setReflections] = useState([]);
  const [loadingReflections, setLoadingReflections] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReflection, setSelectedReflection] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      toast.error('Access denied. Admin privileges required.');
      router.push('/dashboard');
    }
  }, [isAdmin, router]);

  // Fetch all users
  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/users', getAuthHeaders());
      if (response.data.success) {
        setUsers(response.data.users);
      } else {
        toast.error(response.data.error || 'Failed to load users');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserReflections = async (userId) => {
    try {
      setLoadingReflections(true);
      const response = await axios.get(
        `/api/reflections/admin?userId=${userId}`,
        getAuthHeaders()
      );
      if (response.data.success) {
        setReflections(response.data.reflections || []);
      } else {
        toast.error(response.data.error || 'Failed to load reflections');
        setReflections([]);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to load reflections');
      setReflections([]);
    } finally {
      setLoadingReflections(false);
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    fetchUserReflections(user.id || user._id);
  };

  const handleBack = () => {
    setSelectedUser(null);
    setReflections([]);
    setSelectedReflection(null);
    setIsDialogOpen(false);
  };

  const handleReflectionClick = (reflection) => {
    setSelectedReflection(reflection);
    setIsDialogOpen(true);
  };

  const getPreviewText = (reflection) => {
    // Get first non-empty priority
    if (reflection.topPriorities && reflection.topPriorities.find(p => p.trim())) {
      return reflection.topPriorities.find(p => p.trim());
    }
    // Or first non-empty goal
    if (reflection.goalsOfTheDay && reflection.goalsOfTheDay.find(g => g.trim())) {
      return reflection.goalsOfTheDay.find(g => g.trim());
    }
    // Or first non-empty reflection
    if (reflection.reflection && reflection.reflection.find(r => r.trim())) {
      return reflection.reflection.find(r => r.trim());
    }
    return 'No content available';
  };

  const hasContent = (reflection) => {
    return (
      (reflection.topPriorities && reflection.topPriorities.some(p => p.trim())) ||
      (reflection.goalsOfTheDay && reflection.goalsOfTheDay.some(g => g.trim())) ||
      (reflection.schedule && reflection.schedule.some(s => s.activity?.trim())) ||
      (reflection.reflection && reflection.reflection.some(r => r.trim()))
    );
  };

  const filteredUsers = users.filter((user) => {
    // Only show members (exclude admins)
    if (user.role === 'admin') {
      return false;
    }
    // Apply search filter
    return (
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  if (!isAdmin) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reflections</h1>
            <p className="text-muted-foreground">
              View all reflection documents by user
            </p>
          </div>
        </div>

        {!selectedUser ? (
          /* Users List View */
          <Card>
            <CardHeader>
              <CardTitle>All Members</CardTitle>
              <CardDescription>
                Click on a member's email to view all their reflection documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search users by email or name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Spinner className="h-8 w-8" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {searchQuery ? 'No users found matching your search.' : 'No users found.'}
                </p>
              ) : (
                <div className="space-y-2">
                  {filteredUsers.map((user) => (
                    <button
                      key={user.id || user._id}
                      onClick={() => handleUserClick(user)}
                      className="w-full flex items-center justify-between gap-3 rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                          <Mail className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{user.email}</p>
                            {user.name && (
                              <span className="text-sm text-muted-foreground ">
                                ({user.name})
                              </span>
                            )}
                          </div>
                          {user.role && (
                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="mt-1 text-xs">
                              {user.role}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <ChevronLeft className="h-5 w-5 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          /* User Reflections View */
          <div className="space-y-6">
            {/* Back Button and User Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={handleBack}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back to Users
                </Button>
              </div>
              {reflections.length > 0 && (
                <Badge variant="secondary" className="text-sm">
                  {reflections.length} {reflections.length === 1 ? 'Reflection' : 'Reflections'}
                </Badge>
              )}
            </div>

            {loadingReflections ? (
              <div className="flex items-center justify-center py-12">
                <Spinner className="h-8 w-8" />
              </div>
            ) : reflections.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No reflection documents found for this user.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="border rounded-lg overflow-hidden bg-card">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 border-b">
                      <TableHead className="min-w-[250px] px-4">Reflection</TableHead>
                      <TableHead className="min-w-[300px] px-4">Preview</TableHead>
                      <TableHead className="min-w-[120px] px-4">Date</TableHead>
                      <TableHead className="min-w-[100px] px-4">Status</TableHead>
                      <TableHead className="min-w-[120px] px-4">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reflections.map((reflection) => {
                      const reflectionId = reflection._id;
                      const reflectionCode = reflectionId.substring(reflectionId.length - 6).toUpperCase();
                      const preview = getPreviewText(reflection);
                      const hasData = hasContent(reflection);
                      const reflectionDate = new Date(reflection.date);
                      const dayName = format(reflectionDate, 'EEEE');
                      const dateFormatted = format(reflectionDate, 'MMM dd, yyyy');
                      
                      return (
                        <TableRow 
                          key={reflectionId} 
                          className="hover:bg-muted/30 border-b last:border-b-0 cursor-pointer"
                          onClick={() => handleReflectionClick(reflection)}
                        >
                          <TableCell className="px-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-1 h-8 rounded-full flex-shrink-0"
                                style={{ backgroundColor: '#3b82f6' }}
                              />
                              <div className="flex flex-col min-w-0">
                                <span className="text-primary font-medium text-sm truncate">
                                  {dayName}
                                </span>
                                <span className="text-xs text-muted-foreground truncate mt-0.5">
                                  {dateFormatted}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-4">
                            <div className="flex flex-col min-w-0">
                              {hasData ? (
                                <p className="text-sm text-foreground line-clamp-2">
                                  {preview}
                                </p>
                              ) : (
                                <p className="text-sm text-muted-foreground italic">
                                  No content available
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="px-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{dayName}</span>
                              <span className="text-xs text-muted-foreground">
                                {format(reflectionDate, 'MMM dd')}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="px-4">
                            <Badge 
                              variant={hasData ? "default" : "secondary"} 
                              className="text-xs"
                            >
                              {hasData ? 'Complete' : 'Empty'}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-4">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReflectionClick(reflection);
                              }}
                            >
                              <Eye className="h-3.5 w-3.5 mr-1.5" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Detailed Reflection Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="max-w-4xl max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    {selectedReflection && format(new Date(selectedReflection.date), 'EEEE, MMMM dd, yyyy')}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedReflection && (
                      <>
                        Reflection document for {selectedUser?.email}
                        <Badge variant="outline" className="ml-2 text-xs">
                          Updated {format(new Date(selectedReflection.updatedAt || selectedReflection.createdAt), 'MMM dd, yyyy h:mm a')}
                        </Badge>
                      </>
                    )}
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
                  {selectedReflection && (
                    <div className="space-y-6 mt-4">
                      {/* Top Priorities */}
                      {selectedReflection.topPriorities && selectedReflection.topPriorities.some(p => p.trim()) && (
                        <div className="space-y-3">
                          <h4 className="font-semibold text-base text-foreground flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary"></span>
                            Top Priorities
                          </h4>
                          <ul className="space-y-2 pl-6">
                            {selectedReflection.topPriorities
                              .filter(p => p.trim())
                              .map((priority, idx) => (
                                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <span className="text-primary font-bold">•</span>
                                  <span className="flex-1">{priority}</span>
                                </li>
                              ))}
                          </ul>
                        </div>
                      )}

                      {/* Goals of the Day */}
                      {selectedReflection.goalsOfTheDay && selectedReflection.goalsOfTheDay.some(g => g.trim()) && (
                        <div className="space-y-3">
                          <h4 className="font-semibold text-base text-foreground flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary"></span>
                            Goals of the Day
                          </h4>
                          <ul className="space-y-2 pl-6">
                            {selectedReflection.goalsOfTheDay
                              .filter(g => g.trim())
                              .map((goal, idx) => (
                                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <span className="text-primary font-bold">•</span>
                                  <span className="flex-1">{goal}</span>
                                </li>
                              ))}
                          </ul>
                        </div>
                      )}

                      {/* Schedule */}
                      {selectedReflection.schedule && selectedReflection.schedule.some(s => s.activity?.trim()) && (
                        <div className="space-y-3">
                          <h4 className="font-semibold text-base text-foreground flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary"></span>
                            Schedule
                          </h4>
                          <div className="space-y-2 pl-6 border-l-2 border-primary/20">
                            {selectedReflection.schedule
                              .filter(s => s.activity?.trim())
                              .map((item, idx) => (
                                <div key={idx} className="flex items-start gap-3 text-sm py-1">
                                  <span className="font-medium text-foreground w-24 shrink-0">
                                    {item.time}
                                  </span>
                                  <span className="text-muted-foreground flex-1">{item.activity}</span>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Reflection */}
                      {selectedReflection.reflection && selectedReflection.reflection.some(r => r.trim()) && (
                        <div className="space-y-3">
                          <h4 className="font-semibold text-base text-foreground flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary"></span>
                            Reflection
                          </h4>
                          <ul className="space-y-2 pl-6">
                            {selectedReflection.reflection
                              .filter(r => r.trim())
                              .map((ref, idx) => (
                                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <span className="text-primary font-bold">•</span>
                                  <span className="flex-1">{ref}</span>
                                </li>
                              ))}
                          </ul>
                        </div>
                      )}

                      {/* Empty State */}
                      {!hasContent(selectedReflection) && (
                        <div className="text-center py-8">
                          <p className="text-sm text-muted-foreground italic">
                            No content available for this reflection
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

