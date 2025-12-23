'use client';

import { createContext, useState, useContext } from 'react';
import axios from 'axios';
import { getAuthHeaders } from '@/lib/auth';
import { toast } from 'sonner';

const ProjectContext = createContext();

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all projects (optionally filtered by workspace)
  const fetchProjects = async (workspaceId = null) => {
    try {
      setLoading(true);
      const url = workspaceId 
        ? `/api/projects?workspace=${workspaceId}`
        : '/api/projects';
      const response = await axios.get(url, getAuthHeaders());
      if (response.data.success) {
        setProjects(response.data.projects);
      }
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch projects');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Fetch single project
  const fetchProject = async (projectId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/projects/${projectId}`, getAuthHeaders());
      if (response.data.success) {
        setCurrentProject(response.data.project);
      }
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch project');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Create project
  const createProject = async (projectData) => {
    try {
      const response = await axios.post('/api/projects', projectData, getAuthHeaders());
      if (response.data.success) {
        setProjects([response.data.project, ...projects]);
        toast.success('Project created successfully!');
      }
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create project');
      return { success: false, error: error.message };
    }
  };

  // Update project
  const updateProject = async (projectId, projectData) => {
    try {
      const response = await axios.put(`/api/projects/${projectId}`, projectData, getAuthHeaders());
      if (response.data.success) {
        setProjects(projects.map(p => p._id === projectId ? response.data.project : p));
        setCurrentProject(response.data.project);
        toast.success('Project updated successfully!');
      }
      return response.data;
    } catch (error) {
      toast.error('Failed to update project');
      return { success: false, error: error.message };
    }
  };

  // Delete project
  const deleteProject = async (projectId) => {
    try {
      const response = await axios.delete(`/api/projects/${projectId}`, getAuthHeaders());
      if (response.data.success) {
        setProjects(projects.filter(p => p._id !== projectId));
        toast.success('Project deleted successfully!');
      }
      return response.data;
    } catch (error) {
      toast.error('Failed to delete project');
      return { success: false, error: error.message };
    }
  };

  // Fetch tasks for a project
  const fetchTasks = async (projectId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/tasks?project=${projectId}`, getAuthHeaders());
      if (response.data.success) {
        setTasks(response.data.tasks);
      }
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch tasks');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Create task
  const createTask = async (taskData) => {
    try {
      const response = await axios.post('/api/tasks', taskData, getAuthHeaders());
      if (response.data.success) {
        setTasks([response.data.task, ...tasks]);
        toast.success('Task created successfully!');
      }
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create task');
      return { success: false, error: error.message };
    }
  };

  // Update task
  const updateTask = async (taskId, taskData) => {
    try {
      const response = await axios.put(`/api/tasks/${taskId}`, taskData, getAuthHeaders());
      if (response.data.success) {
        setTasks(tasks.map(t => t._id === taskId ? response.data.task : t));
        toast.success('Task updated successfully!');
      }
      return response.data;
    } catch (error) {
      toast.error('Failed to update task');
      return { success: false, error: error.message };
    }
  };

  // Delete task
  const deleteTask = async (taskId) => {
    try {
      const response = await axios.delete(`/api/tasks/${taskId}`, getAuthHeaders());
      if (response.data.success) {
        setTasks(tasks.filter(t => t._id !== taskId));
        toast.success('Task deleted successfully!');
      }
      return response.data;
    } catch (error) {
      toast.error('Failed to delete task');
      return { success: false, error: error.message };
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        currentProject,
        tasks,
        loading,
        fetchProjects,
        fetchProject,
        createProject,
        updateProject,
        deleteProject,
        fetchTasks,
        createTask,
        updateTask,
        deleteTask,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within ProjectProvider');
  }
  return context;
}

