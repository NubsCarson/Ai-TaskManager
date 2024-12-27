import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Chip,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';
import TaskCard from '../components/TaskCard';
import TaskDialog from '../components/TaskDialog';
import { useAuth } from '../contexts/AuthContext';

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

const Tasks: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState(user?.preferences.taskView || 'board');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: '',
  });
  const [sortBy, setSortBy] = useState('');

  useEffect(() => {
    fetchTasks();
  }, [filters, sortBy, searchQuery]);

  const fetchTasks = async () => {
    try {
      let url = '/api/tasks?';
      if (searchQuery) url += `search=${searchQuery}&`;
      if (filters.status) url += `status=${filters.status}&`;
      if (filters.priority) url += `priority=${filters.priority}&`;
      if (filters.category) url += `category=${filters.category}&`;
      if (sortBy) url += `sortBy=${sortBy}`;

      const response = await axios.get(url);
      setTasks(response.data.data.tasks);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskAction = async (taskId: string, action: string) => {
    try {
      await axios.patch(`/api/tasks/${taskId}`, { status: action });
      fetchTasks();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update task');
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setSelectedTask(null);
    setOpenDialog(false);
    fetchTasks();
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleSortClick = (event: React.MouseEvent<HTMLElement>) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleSortClose = () => {
    setSortAnchorEl(null);
  };

  const renderBoardView = () => {
    const columns = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];
    
    return (
      <Grid container spacing={2}>
        {columns.map((status) => (
          <Grid item xs={12} sm={6} md={3} key={status}>
            <Paper
              sx={{
                p: 2,
                height: '100%',
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(0, 0, 0, 0.02)',
              }}
            >
              <Typography variant="h6" gutterBottom>
                {status.replace('_', ' ')}
                <Chip
                  label={tasks.filter((task) => task.status === status).length}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  minHeight: 200,
                }}
              >
                {tasks
                  .filter((task) => task.status === status)
                  .map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onClick={() => handleTaskClick(task)}
                      onStatusChange={handleTaskAction}
                    />
                  ))}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderListView = () => {
    return (
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box sx={{ p: 2 }}>
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onClick={() => handleTaskClick(task)}
              onStatusChange={handleTaskAction}
              listView
            />
          ))}
        </Box>
      </Paper>
    );
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs>
            <Typography variant="h4" component="h1" gutterBottom>
              Tasks
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
            >
              New Task
            </Button>
          </Grid>
        </Grid>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item>
            <IconButton onClick={handleFilterClick}>
              <FilterIcon />
            </IconButton>
            <Menu
              anchorEl={filterAnchorEl}
              open={Boolean(filterAnchorEl)}
              onClose={handleFilterClose}
            >
              <Box sx={{ p: 2, minWidth: 200 }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status}
                    label="Status"
                    onChange={(e) =>
                      setFilters({ ...filters, status: e.target.value })
                    }
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="TODO">Todo</MenuItem>
                    <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                    <MenuItem value="REVIEW">Review</MenuItem>
                    <MenuItem value="DONE">Done</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={filters.priority}
                    label="Priority"
                    onChange={(e) =>
                      setFilters({ ...filters, priority: e.target.value })
                    }
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="LOW">Low</MenuItem>
                    <MenuItem value="MEDIUM">Medium</MenuItem>
                    <MenuItem value="HIGH">High</MenuItem>
                    <MenuItem value="URGENT">Urgent</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={filters.category}
                    label="Category"
                    onChange={(e) =>
                      setFilters({ ...filters, category: e.target.value })
                    }
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="WORK">Work</MenuItem>
                    <MenuItem value="PERSONAL">Personal</MenuItem>
                    <MenuItem value="SHOPPING">Shopping</MenuItem>
                    <MenuItem value="HEALTH">Health</MenuItem>
                    <MenuItem value="EDUCATION">Education</MenuItem>
                    <MenuItem value="OTHER">Other</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Menu>
          </Grid>
          <Grid item>
            <IconButton onClick={handleSortClick}>
              <SortIcon />
            </IconButton>
            <Menu
              anchorEl={sortAnchorEl}
              open={Boolean(sortAnchorEl)}
              onClose={handleSortClose}
            >
              <MenuItem
                onClick={() => {
                  setSortBy('dueDate:asc');
                  handleSortClose();
                }}
              >
                Due Date (Ascending)
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setSortBy('dueDate:desc');
                  handleSortClose();
                }}
              >
                Due Date (Descending)
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setSortBy('priority:desc');
                  handleSortClose();
                }}
              >
                Priority (High to Low)
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setSortBy('priority:asc');
                  handleSortClose();
                }}
              >
                Priority (Low to High)
              </MenuItem>
            </Menu>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Tabs
          value={view}
          onChange={(_, newValue) => setView(newValue)}
          aria-label="task view"
        >
          <Tab value="board" label="Board View" />
          <Tab value="list" label="List View" />
        </Tabs>
      </Box>

      {view === 'board' ? renderBoardView() : renderListView()}

      <TaskDialog
        open={openDialog}
        onClose={handleDialogClose}
        task={selectedTask}
      />
    </Container>
  );
};

export default Tasks; 