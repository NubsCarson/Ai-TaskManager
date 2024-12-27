import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Avatar,
  Switch,
  FormControlLabel,
  Alert,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../hooks/useTheme';

const validationSchema = yup.object({
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name should be of minimum 2 characters length'),
  currentPassword: yup.string().test({
    name: 'currentPassword',
    test: function (value) {
      return !this.parent.newPassword || (!!this.parent.newPassword && !!value);
    },
    message: 'Current password is required when setting a new password',
  }),
  newPassword: yup
    .string()
    .min(8, 'Password should be of minimum 8 characters length')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number'),
  confirmNewPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Passwords must match'),
});

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { mode, toggleTheme } = useTheme();
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  const formik = useFormik({
    initialValues: {
      name: user?.name || '',
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
      emailNotifications: user?.preferences.notifications.email || false,
      pushNotifications: user?.preferences.notifications.push || false,
      taskView: user?.preferences.taskView || 'board',
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        await updateUser({
          name: values.name,
          preferences: {
            theme: mode,
            notifications: {
              email: values.emailNotifications,
              push: values.pushNotifications,
            },
            taskView: values.taskView as 'list' | 'board' | 'calendar',
          },
          ...(values.newPassword && {
            password: values.newPassword,
            currentPassword: values.currentPassword,
          }),
        });
        setStatus({ type: 'success', message: 'Profile updated successfully' });
        resetForm({ values: { ...values, currentPassword: '', newPassword: '', confirmNewPassword: '' } });
      } catch (error: any) {
        setStatus({
          type: 'error',
          message: error.response?.data?.message || 'Failed to update profile',
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" mb={3}>
              <Avatar
                src={user?.avatar}
                alt={user?.name}
                sx={{ width: 80, height: 80, mr: 2 }}
              />
              <Box>
                <Typography variant="h5" gutterBottom>
                  {user?.name}
                </Typography>
                <Typography color="text.secondary">{user?.email}</Typography>
              </Box>
            </Box>

            {status && (
              <Alert severity={status.type} sx={{ mb: 3 }}>
                {status.message}
              </Alert>
            )}

            <form onSubmit={formik.handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Personal Information
                  </Typography>
                  <TextField
                    fullWidth
                    id="name"
                    name="name"
                    label="Full Name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Change Password
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        id="currentPassword"
                        name="currentPassword"
                        label="Current Password"
                        type="password"
                        value={formik.values.currentPassword}
                        onChange={formik.handleChange}
                        error={
                          formik.touched.currentPassword &&
                          Boolean(formik.errors.currentPassword)
                        }
                        helperText={
                          formik.touched.currentPassword && formik.errors.currentPassword
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        id="newPassword"
                        name="newPassword"
                        label="New Password"
                        type="password"
                        value={formik.values.newPassword}
                        onChange={formik.handleChange}
                        error={
                          formik.touched.newPassword && Boolean(formik.errors.newPassword)
                        }
                        helperText={
                          formik.touched.newPassword && formik.errors.newPassword
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        id="confirmNewPassword"
                        name="confirmNewPassword"
                        label="Confirm New Password"
                        type="password"
                        value={formik.values.confirmNewPassword}
                        onChange={formik.handleChange}
                        error={
                          formik.touched.confirmNewPassword &&
                          Boolean(formik.errors.confirmNewPassword)
                        }
                        helperText={
                          formik.touched.confirmNewPassword &&
                          formik.errors.confirmNewPassword
                        }
                      />
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Preferences
                  </Typography>
                  <Box mb={2}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={mode === 'dark'}
                          onChange={toggleTheme}
                          name="darkMode"
                        />
                      }
                      label="Dark Mode"
                    />
                  </Box>
                  <Box mb={2}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formik.values.emailNotifications}
                          onChange={formik.handleChange}
                          name="emailNotifications"
                        />
                      }
                      label="Email Notifications"
                    />
                  </Box>
                  <Box mb={3}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formik.values.pushNotifications}
                          onChange={formik.handleChange}
                          name="pushNotifications"
                        />
                      }
                      label="Push Notifications"
                    />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Default Task View
                    </Typography>
                    <ToggleButtonGroup
                      value={formik.values.taskView}
                      exclusive
                      onChange={(_, value) => {
                        if (value) formik.setFieldValue('taskView', value);
                      }}
                    >
                      <ToggleButton value="list">
                        <ViewListIcon sx={{ mr: 1 }} />
                        List
                      </ToggleButton>
                      <ToggleButton value="board">
                        <ViewModuleIcon sx={{ mr: 1 }} />
                        Board
                      </ToggleButton>
                      <ToggleButton value="calendar">
                        <CalendarIcon sx={{ mr: 1 }} />
                        Calendar
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={formik.isSubmitting}
                    sx={{ mt: 2 }}
                  >
                    Save Changes
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile; 