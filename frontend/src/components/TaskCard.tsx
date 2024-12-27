import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Avatar,
  AvatarGroup,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  AccessTime as AccessTimeIcon,
  Label as LabelIcon,
} from '@mui/icons-material';
import { format, isAfter } from 'date-fns';

interface TaskCardProps {
  task: {
    _id: string;
    title: string;
    description: string;
    status: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    category: string;
    dueDate: string;
    tags: string[];
    assignedTo: Array<{
      _id: string;
      name: string;
      avatar?: string;
    }>;
  };
  onClick: () => void;
  onStatusChange: (taskId: string, status: string) => void;
  listView?: boolean;
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'LOW':
      return '#4CAF50';
    case 'MEDIUM':
      return '#FFC107';
    case 'HIGH':
      return '#FF9800';
    case 'URGENT':
      return '#F44336';
    default:
      return '#757575';
  }
};

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onClick,
  onStatusChange,
  listView = false,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleStatusChange = (status: string) => {
    handleMenuClose();
    onStatusChange(task._id, status);
  };

  const isOverdue = task.dueDate && isAfter(new Date(), new Date(task.dueDate));

  return (
    <Card
      sx={{
        mb: listView ? 2 : 0,
        cursor: 'pointer',
        '&:hover': {
          boxShadow: (theme) => theme.shadows[4],
        },
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 1,
          }}
        >
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontSize: '1rem',
              fontWeight: 500,
              flex: 1,
              mr: 1,
            }}
          >
            {task.title}
          </Typography>
          <IconButton
            size="small"
            onClick={handleMenuClick}
            sx={{ mt: -1, mr: -1 }}
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            onClick={(e) => e.stopPropagation()}
          >
            <MenuItem onClick={() => handleStatusChange('TODO')}>
              Move to Todo
            </MenuItem>
            <MenuItem onClick={() => handleStatusChange('IN_PROGRESS')}>
              Move to In Progress
            </MenuItem>
            <MenuItem onClick={() => handleStatusChange('REVIEW')}>
              Move to Review
            </MenuItem>
            <MenuItem onClick={() => handleStatusChange('DONE')}>
              Move to Done
            </MenuItem>
          </Menu>
        </Box>

        {task.description && (
          <Typography
            color="text.secondary"
            sx={{
              mb: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {task.description}
          </Typography>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 0.5 }}>
          <Chip
            label={task.priority}
            size="small"
            sx={{
              backgroundColor: getPriorityColor(task.priority),
              color: '#fff',
            }}
          />
          <Chip
            label={task.category}
            size="small"
            variant="outlined"
          />
          {task.dueDate && (
            <Tooltip title={format(new Date(task.dueDate), 'PPP')}>
              <Chip
                icon={<AccessTimeIcon />}
                label={format(new Date(task.dueDate), 'MMM d')}
                size="small"
                color={isOverdue ? 'error' : 'default'}
                variant="outlined"
              />
            </Tooltip>
          )}
        </Box>

        {task.tags.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
            {task.tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                icon={<LabelIcon />}
                variant="outlined"
                sx={{ fontSize: '0.75rem' }}
              />
            ))}
          </Box>
        )}

        {task.assignedTo.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: '0.75rem' } }}>
              {task.assignedTo.map((user) => (
                <Tooltip key={user._id} title={user.name}>
                  <Avatar
                    alt={user.name}
                    src={user.avatar}
                    sx={{ width: 24, height: 24 }}
                  >
                    {user.name.charAt(0)}
                  </Avatar>
                </Tooltip>
              ))}
            </AvatarGroup>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskCard; 