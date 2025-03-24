import React from 'react';
import { Button, IconButton, Tooltip } from '@mui/material';
import { LogoutOutlined } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

interface LogoutButtonProps {
  variant?: 'icon' | 'text';
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  size?: 'small' | 'medium' | 'large';
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ 
  variant = 'icon',
  color = 'primary',
  size = 'medium'
}) => {
  const { logout, isLoading } = useAuth();

  const handleLogout = () => {
    logout();
  };

  if (variant === 'icon') {
    return (
      <Tooltip title="Logout">
        <IconButton
          color={color}
          onClick={handleLogout}
          disabled={isLoading}
          size={size}
        >
          <LogoutOutlined />
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <Button
      variant="contained"
      color={color}
      onClick={handleLogout}
      disabled={isLoading}
      startIcon={<LogoutOutlined />}
      size={size}
    >
      Logout
    </Button>
  );
};

export default LogoutButton; 