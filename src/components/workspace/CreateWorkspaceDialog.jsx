'use client';

import { useState } from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useAuth } from '@/context/AuthContext';
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
import { Plus, Briefcase } from 'lucide-react';

export function CreateWorkspaceDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { createWorkspace } = useWorkspace();
  const { isAdmin } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await createWorkspace(formData);
    
    if (result.success) {
      setOpen(false);
      setFormData({
        name: '',
        description: '',
      });
    }
    
    setLoading(false);
  };

  if (!isAdmin) {
    return (
      <Button
        variant="outline"
        className="gap-2"
        disabled
        title="Only admins can create new workspaces"
      >
        <Plus className="h-4 w-4" />
        New Workspace
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Plus className="h-4 w-4" />
          New Workspace
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
              <Briefcase className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Create New Workspace</DialogTitle>
              <DialogDescription>
                Organize your projects in a dedicated workspace
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Workspace Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Personal Projects, Company Work"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What is this workspace for?"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
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
              {loading ? 'Creating...' : 'Create Workspace'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

