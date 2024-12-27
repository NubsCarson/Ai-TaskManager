import { useCallback } from 'react';
import { useAppDispatch } from './useAppDispatch';
import { addNotification, removeNotification } from '../store/slices/uiSlice';

export const useNotifications = () => {
  const dispatch = useAppDispatch();

  const showNotification = useCallback(
    (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
      const notificationId = Date.now().toString();
      dispatch(addNotification({ type, message }));
      
      // Auto remove notification after 5 seconds
      setTimeout(() => {
        dispatch(removeNotification(notificationId));
      }, 5000);
    },
    [dispatch]
  );

  const success = useCallback(
    (message: string) => showNotification('success', message),
    [showNotification]
  );

  const error = useCallback(
    (message: string) => showNotification('error', message),
    [showNotification]
  );

  const info = useCallback(
    (message: string) => showNotification('info', message),
    [showNotification]
  );

  const warning = useCallback(
    (message: string) => showNotification('warning', message),
    [showNotification]
  );

  return {
    success,
    error,
    info,
    warning,
  };
}; 