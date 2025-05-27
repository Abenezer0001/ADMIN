import React from 'react';
const { useState, useEffect } = React;
import { Box, Container, Paper, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

// Use the centralized API URL from config
import { API_BASE_URL } from '../utils/config';

const PasswordSetup: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract token from URL query params
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');

  // State
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<{ email?: string; firstName?: string; isAdmin?: boolean } | null>(null);

  // Password validation
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  useEffect(() => {
    // Validate token when component mounts
    const verifyToken = async () => {
      if (!token) {
        setTokenValid(false);
        setError('No setup token provided. Please use the link from your email.');
        return;
      }

      setIsLoading(true);
      try {
        console.log('Verifying token:', token);
        // The correct endpoint is /api/admin/verify-setup-token (GET request)
        const url = `${API_BASE_URL}/admin/verify-setup-token?token=${token}`;
        console.log('Verification URL:', url);
        
        const response = await axios.get(url);
        console.log('Token verification response:', response.data);
        
        // Type assertion for the response data
        const data = response.data as { 
          message: string;
          user?: {
            email: string;
            firstName: string;
            lastName: string;
          }
        };
        
        console.log('Parsed response data:', data);
        
        if (data.message === 'Token is valid' && data.user) {
          console.log('Token is valid, setting token info:', data.user);
          setTokenValid(true);
          setTokenInfo({
            email: data.user.email,
            firstName: data.user.firstName
          });
        } else {
          console.log('Token validation failed');
          setTokenValid(false);
          setError('The setup link is invalid or has expired. Please request a new one.');
        }
      } catch (err: any) {
        console.error('Token verification error:', err.response?.data || err.message);
        setTokenValid(false);
        setError(err.response?.data?.message || 'Failed to verify setup token. Please try again or request a new link.');
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const validateForm = () => {
    let isValid = true;

    // Password validation
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      isValid = false;
    } else {
      setPasswordError('');
    }

    // Confirm password validation
    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // The correct endpoint for password setup
      const url = `${API_BASE_URL}/admin/setup-password`;
      console.log('Setting up password, sending request to:', url);
      
      const response = await axios.post(url, {
        token,
        password
      });
      
      console.log('Password setup response:', response.status);

      // Type assertion for the response data
      const data = response.data as {
        success: boolean;
        message?: string;
      };

      if (data.success) {
        setSuccess(true);
        // Redirect to login after a short delay
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(data.message || 'Failed to set up password. Please try again.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    if (isLoading && tokenValid === null) {
      return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%">
          <CircularProgress size={60} />
          <Typography variant="h6" mt={2}>Verifying your setup link...</Typography>
        </Box>
      );
    }

    if (tokenValid === false) {
      return (
        <Box textAlign="center" p={3}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || 'Invalid setup link'}
          </Alert>
          <Typography variant="body1" mb={3}>
            The password setup link is invalid or has expired.
          </Typography>
          <Button variant="contained" color="primary" onClick={() => navigate('/login')}>
            Return to Login
          </Button>
        </Box>
      );
    }

    if (success) {
      return (
        <Box textAlign="center" p={3}>
          <Alert severity="success" sx={{ mb: 2 }}>
            Password successfully set! You will be redirected to the login page.
          </Alert>
          <Button variant="contained" color="primary" onClick={() => navigate('/login')}>
            Go to Login
          </Button>
        </Box>
      );
    }

    return (
      <Box component="form" onSubmit={handleSubmit} noValidate p={3}>
        {tokenInfo?.firstName && (
          <Typography variant="h6" mb={2}>
            Welcome, {tokenInfo.firstName}!
          </Typography>
        )}
        
        <Typography variant="body1" mb={3}>
          Please set a password for your {tokenInfo?.isAdmin ? 'admin ' : ''}account.
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box mb={3} position="relative">
          <TextField
            required
            fullWidth
            label="New Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            error={!!passwordError}
            helperText={passwordError}
            sx={{ mb: 2 }}
          />
          <Box 
            position="absolute" 
            right={10} 
            top={15} 
            onClick={() => setShowPassword(!showPassword)}
            sx={{ cursor: 'pointer' }}
          >
            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
          </Box>
        </Box>

        <TextField
          required
          fullWidth
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
          error={!!confirmPasswordError}
          helperText={confirmPasswordError}
          sx={{ mb: 3 }}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          disabled={isLoading}
          sx={{ mb: 2 }}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Set Password'}
        </Button>
      </Box>
    );
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        minHeight: '100vh',
        backgroundColor: 'background.default',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Box display="flex" justifyContent="center" p={3} bgcolor="primary.main">
            <RestaurantMenuIcon sx={{ fontSize: 40, color: 'white' }} />
          </Box>
          
          <Box textAlign="center" p={3} pb={1}>
            <Typography variant="h4" component="h1" fontWeight="bold">
              Password Setup
            </Typography>
            {tokenInfo?.email && (
              <Typography variant="body2" color="text.secondary">
                {tokenInfo.email}
              </Typography>
            )}
          </Box>
          
          {renderContent()}
        </Paper>
      </Container>
    </Box>
  );
};

export default PasswordSetup;
