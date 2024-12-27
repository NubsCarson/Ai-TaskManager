import React, { useEffect } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  FormHelperText,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
  Autocomplete,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import axios from 'axios';

interface TaskDialogProps {
  open: boolean;
  onClose: () => void;
  task?: {
    _id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    category: string;
    dueDate: string;
    tags: string[];
    assignedTo: Array<{
      _id: string;
      name: string;
      avatar?: string;
    }>;
  } | null;
}

const validationSchema = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string(),
  status: yup.string().required('Status is required'),
  priority: yup.string().required('Priority is required'),
  category: yup.string().required('Category is required'),
  dueDate: yup.date().nullable(),
  tags: yup.array().of(yup.string()),
  assignedTo: yup.array().of(
    yup.object({
      _id: yup.string().required(),
      name: yup.string().required(),
    })
  ),
});

const TaskDialog: React.FC<TaskDialogProps> = ({ open, onClose, task }) => {
  const [users, setUsers] = React.useState<Array<{ _id: string; name: string; avatar?: string }>>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [useAI, setUseAI] = React.useState(false);

  useEffect(() => {
    // Fetch users for assignment
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/users');
        setUsers(response.data.data.users);
      } catch (err) {
        console.error('Failed to fetch users:', err);
      }
    };

    if (open) {
      fetchUsers();
    }
  }, [open]);

  const formik = useFormik({
    initialValues: {
      title: task?.title || '',
      description: task?.description || '',
      status: task?.status || 'TODO',
      priority: task?.priority || 'MEDIUM',
      category: task?.category || 'WORK',
      dueDate: task?.dueDate ? new Date(task.dueDate) : null,
      tags: task?.tags || [],
      assignedTo: task?.assignedTo || [],
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError(null);
      try {
        const endpoint = task ? `/api/tasks/${task._id}` : '/api/tasks';
        const method = task ? 'patch' : 'post';
        
        await axios[method](endpoint, {
          ...values,
          useAI,
        });
        
        onClose();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to save task');
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>{task ? 'Edit Task' : 'New Task'}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              id="title"
              name="title"
              label="Title"
              value={formik.values.title}
              onChange={formik.handleChange}
              error={formik.touched.title && Boolean(formik.errors.title)}
              helperText={formik.touched.title && formik.errors.title}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              id="description"
              name="description"
              label="Description"
              multiline
              rows={4}
              value={formik.values.description}
              onChange={formik.handleChange}
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={formik.touched.description && formik.errors.description}
              sx={{ mb: 2 }}
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select
                id="status"
                name="status"
                value={formik.values.status}
                onChange={formik.handleChange}
                error={formik.touched.status && Boolean(formik.errors.status)}
              >
                <MenuItem value="TODO">Todo</MenuItem>
                <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                <MenuItem value="REVIEW">Review</MenuItem>
                <MenuItem value="DONE">Done</MenuItem>
              </Select>
              {formik.touched.status && formik.errors.status && (
                <FormHelperText error>{formik.errors.status}</FormHelperText>
              )}
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Priority</InputLabel>
              <Select
                id="priority"
                name="priority"
                value={formik.values.priority}
                onChange={formik.handleChange}
                error={formik.touched.priority && Boolean(formik.errors.priority)}
              >
                <MenuItem value="LOW">Low</MenuItem>
                <MenuItem value="MEDIUM">Medium</MenuItem>
                <MenuItem value="HIGH">High</MenuItem>
                <MenuItem value="URGENT">Urgent</MenuItem>
              </Select>
              {formik.touched.priority && formik.errors.priority && (
                <FormHelperText error>{formik.errors.priority}</FormHelperText>
              )}
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Category</InputLabel>
              <Select
                id="category"
                name="category"
                value={formik.values.category}
                onChange={formik.handleChange}
                error={formik.touched.category && Boolean(formik.errors.category)}
              >
                <MenuItem value="WORK">Work</MenuItem>
                <MenuItem value="PERSONAL">Personal</MenuItem>
                <MenuItem value="SHOPPING">Shopping</MenuItem>
                <MenuItem value="HEALTH">Health</MenuItem>
                <MenuItem value="EDUCATION">Education</MenuItem>
                <MenuItem value="OTHER">Other</MenuItem>
              </Select>
              {formik.touched.category && formik.errors.category && (
                <FormHelperText error>{formik.errors.category}</FormHelperText>
              )}
            </FormControl>

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Due Date"
                value={formik.values.dueDate}
                onChange={(value: Date | null) => formik.setFieldValue('dueDate', value)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    sx: { mb: 2 },
                  },
                }}
              />
            </LocalizationProvider>

            <Autocomplete
              multiple
              freeSolo
              id="tags"
              options={[]}
              value={formik.values.tags}
              onChange={(_, newValue) => {
                formik.setFieldValue('tags', newValue);
              }}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option}
                    label={option}
                    size="small"
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Tags"
                  placeholder="Add tags"
                  fullWidth
                  sx={{ mb: 2 }}
                />
              )}
            />

            <Autocomplete
              multiple
              id="assignedTo"
              options={users}
              value={formik.values.assignedTo}
              onChange={(_, newValue) => {
                formik.setFieldValue('assignedTo', newValue);
              }}
              getOptionLabel={(option) => option.name}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option._id}
                    label={option.name}
                    size="small"
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Assigned To"
                  placeholder="Assign users"
                  fullWidth
                  sx={{ mb: 2 }}
                />
              )}
            />

            {!task && (
              <FormControlLabel
                control={
                  <Switch
                    checked={useAI}
                    onChange={(e) => setUseAI(e.target.checked)}
                  />
                }
                label="Use AI for suggestions"
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {task ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TaskDialog; 