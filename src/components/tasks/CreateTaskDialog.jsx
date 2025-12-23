'use client';

import { useState, useEffect } from 'react';
import { useProjects } from '@/context/ProjectContext';
import axios from 'axios';
import { getAuthHeaders } from '@/lib/auth';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, X, Users } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export function CreateTaskDialog({ projectId, defaultStatus = 'todo' }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState(new Set());
  const { createTask } = useProjects();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: defaultStatus,
    priority: 'medium',
    dueDate: '',
    assignedEmails: '',
  });

  // Fetch workspace members when dialog opens
  useEffect(() => {
    if (open && projectId) {
      fetchWorkspaceMembers();
    } else {
      // Reset selections when dialog closes
      setSelectedMemberIds(new Set());
    }
  }, [open, projectId]);

  const fetchWorkspaceMembers = async () => {
    try {
      setLoadingMembers(true);
      const response = await axios.get(
        `/api/projects/${projectId}/members`,
        getAuthHeaders()
      );
      if (response.data.success) {
        setMembers(response.data.members || []);
      }
    } catch (error) {
      console.error('Failed to fetch workspace members:', error);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleMemberToggle = (memberId) => {
    const newSelected = new Set(selectedMemberIds);
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId);
    } else {
      newSelected.add(memberId);
    }
    setSelectedMemberIds(newSelected);
  };

  const handleAddSelectedMembers = () => {
    const newEmails = members
      .filter(member => selectedMemberIds.has(member.id))
      .map(member => member.email);
    
    const existingEmails = getSelectedEmails();
    const allEmails = [...new Set([...existingEmails, ...newEmails])];
    
    setFormData({ ...formData, assignedEmails: allEmails.join(', ') });
    setSelectedMemberIds(new Set());
  };

  const handleRemoveEmail = (emailToRemove) => {
    const currentEmails = formData.assignedEmails
      .split(',')
      .map(e => e.trim())
      .filter(e => e && e !== emailToRemove);
    setFormData({ ...formData, assignedEmails: currentEmails.join(', ') });
  };

  const getSelectedEmails = () => {
    if (!formData.assignedEmails) return [];
    return formData.assignedEmails
      .split(',')
      .map(e => e.trim())
      .filter(e => e);
  };

  const validateWorkspaceMembers = () => {
    const selectedEmails = getSelectedEmails();
    if (selectedEmails.length === 0) {
      return { valid: true };
    }

    // Get list of valid workspace member emails
    const validMemberEmails = new Set(members.map(m => m.email.toLowerCase()));
    
    // Check if all selected emails are workspace members
    const invalidEmails = selectedEmails.filter(
      email => !validMemberEmails.has(email.toLowerCase())
    );

    if (invalidEmails.length > 0) {
      return {
        valid: false,
        error: `The following users are not workspace members: ${invalidEmails.join(', ')}. Please refresh and try again.`
      };
    }

    return { valid: true };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Refresh member list to ensure we have latest data
    await fetchWorkspaceMembers();
    
    // Validate that all selected emails are workspace members
    const validation = validateWorkspaceMembers();
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setLoading(true);

    const result = await createTask({
      ...formData,
      projectId,
    });
    
    if (result.success) {
      setOpen(false);
      setSelectedMemberIds(new Set());
      setFormData({
        title: '',
        description: '',
        status: defaultStatus,
        priority: 'medium',
        dueDate: '',
        assignedEmails: '',
      });
    }
    
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Add a new task to track work and progress.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              placeholder="Enter task title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the task"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="in-review">In Review</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
          </div>

          <div className="space-y-3">
            <Label>Assign To</Label>
            
            {/* Selected Members Display */}
            {getSelectedEmails().length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Assigned members:</p>
                <div className="flex flex-wrap gap-2">
                  {getSelectedEmails().map((email) => {
                    const member = members.find(m => m.email === email);
                    return (
                      <Badge
                        key={email}
                        variant="secondary"
                        className="flex items-center gap-1.5 px-2 py-1"
                      >
                        {member && (
                          <Avatar className="h-4 w-4">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback className="text-[10px]">
                              {member.name?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <span className="text-xs">{member?.name || email}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveEmail(email)}
                          className="ml-1 rounded-full hover:bg-muted"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Member Selection List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Select workspace members:</p>
                {selectedMemberIds.size > 0 && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddSelectedMembers}
                    className="h-7 text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Selected ({selectedMemberIds.size})
                  </Button>
                )}
              </div>
              
              {loadingMembers ? (
                <div className="text-sm text-muted-foreground py-4 text-center">
                  Loading members...
                </div>
              ) : members.length === 0 ? (
                <div className="text-sm text-muted-foreground py-4 text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  No workspace members found
                </div>
              ) : (
                <ScrollArea className="h-32 rounded-md border p-2">
                  <div className="space-y-2">
                    {members.map((member) => {
                      const isSelected = selectedMemberIds.has(member.id);
                      const isAlreadyAssigned = getSelectedEmails().includes(member.email);
                      
                      return (
                        <label
                          key={member.id}
                          className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-primary/10'
                              : isAlreadyAssigned
                              ? 'opacity-50 cursor-not-allowed'
                              : 'hover:bg-muted/50'
                          }`}
                        >
                          <Checkbox
                            checked={isSelected}
                            disabled={isAlreadyAssigned}
                            onCheckedChange={() => handleMemberToggle(member.id)}
                          />
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback>
                              {member.name?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{member.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                          </div>
                          {isAlreadyAssigned && (
                            <Badge variant="outline" className="text-xs">
                              Added
                            </Badge>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

