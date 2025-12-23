'use client';

import { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { getAuthHeaders } from '@/lib/auth';
import { toast } from 'sonner';

const WorkspaceContext = createContext();

export function WorkspaceProvider({ children }) {
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [loading, setLoading] = useState(false);
  const lastWorkspaceIdRef = useRef(null);
  const hasInitialFetch = useRef(false);

  // Fetch all workspaces - memoized to prevent unnecessary re-renders
  const fetchWorkspaces = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/workspaces', getAuthHeaders());
      if (response.data.success) {
        // Get current user ID from localStorage
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const currentUserId = currentUser.id || currentUser._id;
        
        // console.log('Frontend: Received workspaces:', {
        //   currentUserId,
        //   count: response.data.workspaces.length,
        //   workspaces: response.data.workspaces.map(ws => ({
        //     id: ws._id,
        //     name: ws.name,
        //     owner: ws.owner?._id || ws.owner,
        //     membersCount: ws.members?.length || 0,
        //     members: ws.members?.map(m => ({
        //       userId: m.user?._id || m.user,
        //       userName: m.user?.name,
        //       userEmail: m.user?.email,
        //       role: m.role,
        //       isCurrentUser: (m.user?._id || m.user) === currentUserId
        //     })) || [],
        //     isOwner: (ws.owner?._id || ws.owner) === currentUserId,
        //     hasCurrentUserAsMember: ws.members?.some(m => (m.user?._id || m.user) === currentUserId) || false
        //   }))
        // });
        setWorkspaces(response.data.workspaces);
      } else {
        console.error('Frontend: Failed to fetch workspaces:', response.data);
      }
      return response.data;
    } catch (error) {
      console.error('Frontend: Error fetching workspaces:', error);
      toast.error('Failed to fetch workspaces');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch workspaces on mount and when window gains focus
  // This helps when a member is added in another browser
  useEffect(() => {
    // Initial fetch
    if (!hasInitialFetch.current) {
      fetchWorkspaces();
      hasInitialFetch.current = true;
    }

    // Refresh workspaces when window gains focus (user switches back to tab)
    const handleFocus = () => {
      fetchWorkspaces();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchWorkspaces]);

  // Load current workspace from localStorage when workspaces change
  useEffect(() => {
    // console.log('WorkspaceContext: Workspaces changed, setting currentWorkspace', {
    //   workspacesCount: workspaces.length,
    //   workspaces: workspaces.map(w => ({ id: w._id, name: w.name }))
    // });
    
    if (workspaces.length > 0) {
      const savedWorkspaceId = localStorage.getItem('currentWorkspaceId');
      console.log('WorkspaceContext: Saved workspace ID from localStorage:', savedWorkspaceId);
      
      if (savedWorkspaceId) {
        // Try to find and set the saved workspace
        const workspace = workspaces.find(w => w._id === savedWorkspaceId || w._id?.toString() === savedWorkspaceId);
        if (workspace) {
          console.log('WorkspaceContext: Found saved workspace, setting as current:', workspace.name);
          // Always update to get fresh member data
          lastWorkspaceIdRef.current = workspace._id || workspace._id?.toString();
          setCurrentWorkspace(workspace);
        } else {
          console.log('WorkspaceContext: Saved workspace not found in received workspaces, setting first workspace');
          // Saved workspace not found, set the first one
          lastWorkspaceIdRef.current = workspaces[0]._id || workspaces[0]._id?.toString();
          setCurrentWorkspace(workspaces[0]);
          localStorage.setItem('currentWorkspaceId', workspaces[0]._id || workspaces[0]._id?.toString());
        }
      } else {
        console.log('WorkspaceContext: No saved workspace, setting first workspace');
        // If no saved workspace, set the first one
        lastWorkspaceIdRef.current = workspaces[0]._id || workspaces[0]._id?.toString();
        setCurrentWorkspace(workspaces[0]);
        localStorage.setItem('currentWorkspaceId', workspaces[0]._id || workspaces[0]._id?.toString());
      }
    } else {
      console.log('WorkspaceContext: No workspaces available, clearing currentWorkspace');
      setCurrentWorkspace(null);
    }
  }, [workspaces]);

  // Create workspace
  const createWorkspace = async (workspaceData) => {
    try {
      const response = await axios.post('/api/workspaces', workspaceData, getAuthHeaders());
      if (response.data.success) {
        setWorkspaces([response.data.workspace, ...workspaces]);
        toast.success('Workspace created successfully!');
        
        // Auto-switch to new workspace
        switchWorkspace(response.data.workspace);
      }
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create workspace');
      return { success: false, error: error.message };
    }
  };

  // Switch workspace
  const switchWorkspace = (workspace) => {
    if (lastWorkspaceIdRef.current !== workspace._id) {
      lastWorkspaceIdRef.current = workspace._id;
      setCurrentWorkspace(workspace);
      localStorage.setItem('currentWorkspaceId', workspace._id);
      toast.success(`Switched to ${workspace.name}`);
    }
  };

  // Delete workspace
  const deleteWorkspace = async (workspaceId) => {
    try {
      const response = await axios.delete(`/api/workspaces/${workspaceId}`, getAuthHeaders());
      if (response.data.success) {
        // Remove from workspaces list
        setWorkspaces(workspaces.filter(w => w._id !== workspaceId));
        
        // If deleted workspace was current, clear it
        if (currentWorkspace?._id === workspaceId) {
          setCurrentWorkspace(null);
          localStorage.removeItem('currentWorkspaceId');
        }
        
        toast.success('Workspace deleted successfully');
      }
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete workspace');
      return { success: false, error: error.message };
    }
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        currentWorkspace,
        loading,
        fetchWorkspaces,
        createWorkspace,
        switchWorkspace,
        deleteWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within WorkspaceProvider');
  }
  return context;
}

