import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { tasks as tasksApi } from '../../services/api';

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

const initialState: TasksState = {
  items: [],
  stats: null,
  loading: false,
  error: null,
  filters: {
    status: '',
    priority: '',
    category: '',
    search: '',
  },
  sort: '',
};

// Async thunks
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { tasks: TasksState };
      const { filters, sort } = state.tasks;
      const response = await tasksApi.getAll({
        ...filters,
        sortBy: sort,
      });
      return response.data.data.tasks;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch tasks');
    }
  }
);

export const fetchTaskStats = createAsyncThunk(
  'tasks/fetchTaskStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await tasksApi.getStats();
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch task statistics');
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData: Partial<Task>, { rejectWithValue }) => {
    try {
      const response = await tasksApi.create(taskData);
      return response.data.data.task;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create task');
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, data }: { id: string; data: Partial<Task> }, { rejectWithValue }) => {
    try {
      const response = await tasksApi.update(id, data);
      return response.data.data.task;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update task');
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id: string, { rejectWithValue }) => {
    try {
      await tasksApi.delete(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete task');
    }
  }
);

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<{ key: string; value: string }>) => {
      state.filters[action.payload.key as keyof typeof state.filters] = action.payload.value;
    },
    setSort: (state, action: PayloadAction<string>) => {
      state.sort = action.payload;
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.sort = initialState.sort;
    },
  },
  extraReducers: (builder) => {
    // Fetch tasks
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch stats
    builder
      .addCase(fetchTaskStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });

    // Create task
    builder
      .addCase(createTask.fulfilled, (state, action) => {
        state.items.push(action.payload);
      });

    // Update task
    builder
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.items.findIndex((task) => task._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });

    // Delete task
    builder
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.items = state.items.filter((task) => task._id !== action.payload);
      });
  },
});

export const { setFilter, setSort, clearFilters } = tasksSlice.actions;

export default tasksSlice.reducer; 