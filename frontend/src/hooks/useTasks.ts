import { useCallback } from 'react';
import { useAppDispatch } from './useAppDispatch';
import { useAppSelector } from './useAppSelector';
import {
  fetchTasks,
  fetchTaskStats,
  createTask,
  updateTask,
  deleteTask,
  setFilter,
  setSort,
  clearFilters,
} from '../store/slices/tasksSlice';
import { useNotifications } from './useNotifications';
import type { RootState } from '../store';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category: string;
  dueDate: string;
  tags: string[];
  assignedTo: Array<{
    _id: string;
    name: string;
    avatar?: string;
  }>;
}

interface TasksState {
  items: Task[];
  stats: {
    overview: {
      total: number;
      completed: number;
      overdue: number;
      completion_rate: number;
    };
    byCategory: Array<{ _id: string; count: number }>;
    byPriority: Array<{ _id: string; count: number }>;
  } | null;
  loading: boolean;
  error: string | null;
  filters: {
    status: string;
    priority: string;
    category: string;
    search: string;
  };
  sort: string;
}

export const useTasks = () => {
  const dispatch = useAppDispatch();
  const notifications = useNotifications();
  const { items, stats, loading, error, filters, sort } = useAppSelector(
    (state: RootState) => state.tasks as TasksState
  );

  const loadTasks = useCallback(async () => {
    try {
      await dispatch(fetchTasks()).unwrap();
    } catch (err: any) {
      notifications.error(err.message || 'Failed to load tasks');
    }
  }, [dispatch, notifications]);

  const loadStats = useCallback(async () => {
    try {
      await dispatch(fetchTaskStats()).unwrap();
    } catch (err: any) {
      notifications.error(err.message || 'Failed to load task statistics');
    }
  }, [dispatch, notifications]);

  const addTask = useCallback(
    async (taskData: Partial<Task>) => {
      try {
        await dispatch(createTask(taskData)).unwrap();
        notifications.success('Task created successfully');
        return true;
      } catch (err: any) {
        notifications.error(err.message || 'Failed to create task');
        return false;
      }
    },
    [dispatch, notifications]
  );

  const editTask = useCallback(
    async (id: string, data: Partial<Task>) => {
      try {
        await dispatch(updateTask({ id, data })).unwrap();
        notifications.success('Task updated successfully');
        return true;
      } catch (err: any) {
        notifications.error(err.message || 'Failed to update task');
        return false;
      }
    },
    [dispatch, notifications]
  );

  const removeTask = useCallback(
    async (id: string) => {
      try {
        await dispatch(deleteTask(id)).unwrap();
        notifications.success('Task deleted successfully');
        return true;
      } catch (err: any) {
        notifications.error(err.message || 'Failed to delete task');
        return false;
      }
    },
    [dispatch, notifications]
  );

  const updateFilter = useCallback(
    (key: string, value: string) => {
      dispatch(setFilter({ key, value }));
      loadTasks();
    },
    [dispatch, loadTasks]
  );

  const updateSort = useCallback(
    (value: string) => {
      dispatch(setSort(value));
      loadTasks();
    },
    [dispatch, loadTasks]
  );

  const resetFilters = useCallback(() => {
    dispatch(clearFilters());
    loadTasks();
  }, [dispatch, loadTasks]);

  return {
    tasks: items,
    stats,
    loading,
    error,
    filters,
    sort,
    loadTasks,
    loadStats,
    addTask,
    editTask,
    removeTask,
    updateFilter,
    updateSort,
    resetFilters,
  };
}; 