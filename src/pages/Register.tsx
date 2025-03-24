import React from 'react';
import { TextField, Button, Typography, Box, Container, Paper, Alert, CircularProgress, Checkbox, FormControlLabel } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import GoogleIcon from '@mui/icons-material/Google';
import AppleIcon from '@mui/icons-material/Apple';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const Register = () => {
  // Form state
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [agreeToTerms, setAgreeToTerms] = React.useState(false);
  
  // Error state
  const [firstNameError, setFirstNameError] = React.useState('');
  const [lastNameError, setLastNameError] = React.useState('');
  const [usernameError, setUsernameError] = React.useState('');
  const [emailError, setEmailError] = React.useState('');
  const [passwordError, setPasswordError] = React.useState('');
  const [confirmPasswordError, setConfirmPasswordError] = React.useState('');
  const [termsError, setTermsError] = React.useState('');
  
  // Sidebar image slider state
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const slides = [
    {
      image: 'https://res.cloudinary.com/dptx5wjus/image/upload/v1742145284/Untitled_design_1_u8xhd0.png',
      title: 'Culinary Management',
      subtitle: 'Streamline Your Restaurant Operations',
    },
    {
      image: 'https://res.cloudinary.com/dptx5wjus/image/upload/v1742145290/13_ymko62.png',
      title: 'Menu Optimization',
      subtitle: 'Boost Revenue with Smart Menu Design',
    },
    {
      image: 'https://res.cloudinary.com/dptx5wjus/image/upload/v1742145285/17_uk5lbs.png',
      title: 'Staff Management',
      subtitle: 'Schedule and Manage Your Team Effectively',
    },
  ];
  
  // Auto-slide functionality
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev: number) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    
    return () => clearInterval(interval);
  }, [slides.length]);
  
  // Auth context
  const { register, isLoading, error, clearError } = useAuth();
  
  // Validate form
  const validateForm = () => {
    let isValid = true;
    
    // Reset errors
    setFirstNameError('');
    setLastNameError('');
    setUsernameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setTermsError('');
    
    // Validate first name
    if (!firstName.trim()) {
      setFirstNameError('First name is required');
      isValid = false;
    }
    
    // Validate last name
    if (!lastName.trim()) {
      setLastNameError('Last name is required');
      isValid = false;
    }
    
    // Validate username
    if (!username.trim()) {
      setUsernameError('Username is required');
      isValid = false;
    } else if (username.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      isValid = false;
    }
    
    // Validate email
    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email is invalid');
      isValid = false;
    }
    
    // Validate password
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }
    
    // Validate confirm password
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    }
    
    // Validate terms agreement
    if (!agreeToTerms) {
      setTermsError('You must agree to the Terms & Conditions');
      isValid = false;
    }
    
    return isValid;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Clear any previous errors
    clearError();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    // Register user
    try {
      console.log('Submitting registration with:', { email, password, firstName, lastName, username });
      await register({
        email,
        password,
        firstName,
        lastName,
        username
      });
    } catch (err) {
      // Error is handled by the auth context
      console.error('Registration error:', err);
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  return (
    <Box sx={{ 
      display: 'flex', 
      width: '100vw', 
      height: '100vh',
      overflow: 'hidden'
    }}>
      {/* Left side - Image Slider (Redesigned) */}
      <Box sx={{ 
        flex: { xs: 0, md: 1 }, 
        display: { xs: 'none', md: 'flex' },
        position: 'relative',
        overflow: 'hidden',
        color: 'white',
      }}>
        <Box sx={{ position: 'absolute', top: 20, left: 20, zIndex: 2 }}>
          <RestaurantMenuIcon sx={{ fontSize: 40 }} />
        </Box>
        
        {/* Slides Container */}
        <Box sx={{ 
          position: 'relative', 
          width: '100%', 
          height: '100%',
        }}>
          {slides.map((slide, index) => (
            <Box
              key={index}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: currentSlide === index ? 1 : 0,
                transition: 'opacity 1.5s ease-in-out',
                zIndex: 0,
              }}
            >
              {/* Image with overlay */}
              <Box sx={{ 
                position: 'relative',
                width: '100%',
                height: '100%',
              }}>
                <Box 
                  component="img" 
                  src={slide.image}
                  alt={slide.title}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                {/* Dark overlay */}
                <Box sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  zIndex: 1,
                }} />
              </Box>
              
              {/* Content */}
              <Box sx={{ 
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 2, 
                textAlign: 'center',
                px: 6, 
                maxWidth: 500,
                width: '100%',
                animation: currentSlide === index ? 'fadeInUp 1s ease-in-out' : 'none',
                '@keyframes fadeInUp': {
                  '0%': {
                    opacity: 0,
                    transform: 'translate(-50%, -40%)'
                  },
                  '100%': {
                    opacity: 1,
                    transform: 'translate(-50%, -50%)'
                  }
                }
              }}>
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2, textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>
                  {slide.title}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'light', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                  {slide.subtitle}
                </Typography>
                <Button 
                  variant="contained" 
                  sx={{ 
                    mt: 4, 
                    bgcolor: 'white', 
                    color: 'primary.main',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.9)',
                    },
                    borderRadius: 2,
                    px: 3,
                    py: 1.5,
                    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                  }}
                >
                  Learn More
                </Button>
              </Box>
            </Box>
          ))}
        </Box>
        
        {/* Dots navigation */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            position: 'absolute',
            bottom: 20,
            left: 0,
            right: 0,
            zIndex: 2,
          }}
        >
          {slides.map((_, index) => (
            <Box 
              key={index}
              onClick={() => setCurrentSlide(index)}
              sx={{ 
                width: 10, 
                height: 10, 
                borderRadius: '50%', 
                bgcolor: currentSlide === index ? 'white' : 'rgba(255,255,255,0.5)', 
                mx: 0.5,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.2)',
                }
              }} 
            />
          ))}
        </Box>
      </Box>
      
      {/* Right side - Register form */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        p: 4,
        position: 'relative',
        maxHeight: '100%',
        overflow: 'auto',
        bgcolor: 'background.paper'
      }}>
        <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            variant="outlined" 
            size="small" 
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Back to website
          </Button>
        </Box>
        
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 400, mx: 'auto', width: '100%' }}>
          <Typography component="h1" variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            Create an account
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Create your account to manage your restaurant
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                required
                fullWidth
                id="firstName"
                label="First Name"
                name="firstName"
                autoComplete="given-name"
                autoFocus
                value={firstName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)}
                error={!!firstNameError}
                helperText={firstNameError}
                disabled={isLoading}
                InputProps={{
                  sx: { borderRadius: 2 }
                }}
              />
              
              <TextField
                required
                fullWidth
                id="lastName"
                label="Last Name"
                name="lastName"
                autoComplete="family-name"
                value={lastName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)}
                error={!!lastNameError}
                helperText={lastNameError}
                disabled={isLoading}
                InputProps={{
                  sx: { borderRadius: 2 }
                }}
              />
            </Box>
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              value={username}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
              error={!!usernameError}
              helperText={usernameError}
              disabled={isLoading}
              sx={{ mb: 2 }}
              InputProps={{
                sx: { borderRadius: 2 }
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              error={!!emailError}
              helperText={emailError}
              disabled={isLoading}
              sx={{ mb: 2 }}
              InputProps={{
                sx: { borderRadius: 2 }
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              error={!!passwordError}
              helperText={passwordError}
              disabled={isLoading}
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <Box sx={{ cursor: 'pointer' }} onClick={togglePasswordVisibility}>
                    {showPassword ? <VisibilityOffIcon color="action" /> : <VisibilityIcon color="action" />}
                  </Box>
                ),
                sx: { borderRadius: 2 }
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
              error={!!confirmPasswordError}
              helperText={confirmPasswordError}
              disabled={isLoading}
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <Box sx={{ cursor: 'pointer' }} onClick={toggleConfirmPasswordVisibility}>
                    {showConfirmPassword ? <VisibilityOffIcon color="action" /> : <VisibilityIcon color="action" />}
                  </Box>
                ),
                sx: { borderRadius: 2 }
              }}
            />
            
            <FormControlLabel
              control={<Checkbox 
                checked={agreeToTerms}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAgreeToTerms(e.target.checked)}
                color="primary" 
              />}
              label={
                <Typography variant="body2">
                  I agree to the{' '}
                  <Link to="/terms" style={{ textDecoration: 'none', color: 'primary.main' }}>
                    Terms & Conditions
                  </Link>
                </Typography>
              }
              sx={{ mb: 1 }}
            />
            {termsError && (
              <Typography color="error" variant="caption" sx={{ mt: -1, mb: 1, display: 'block' }}>
                {termsError}
              </Typography>
            )}
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mt: 1, 
                mb: 2, 
                py: 1.5,
                borderRadius: 2,
                backgroundColor: 'primary.main',
                boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 15px rgba(0,0,0,0.2)',
                  backgroundColor: 'primary.dark',
                },
              }}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Create account'}
            </Button>
            
            <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
              <Box sx={{ flex: 1, height: 1, bgcolor: 'divider' }} />
              <Typography variant="body2" color="text.secondary" sx={{ mx: 2 }}>
                Or register with
              </Typography>
              <Box sx={{ flex: 1, height: 1, bgcolor: 'divider' }} />
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<GoogleIcon />}
                sx={{ 
                  borderRadius: 2, 
                  py: 1, 
                  textTransform: 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(66, 133, 244, 0.04)',
                    borderColor: '#4285F4',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                  }
                }}
              >
                Google
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<AppleIcon />}
                sx={{ 
                  borderRadius: 2, 
                  py: 1, 
                  textTransform: 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    borderColor: '#000',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                  }
                }}
              >
                Apple
              </Button>
            </Box>
            
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2">
                Already have an account?{' '}
                <Link to="/login" style={{ 
                  textDecoration: 'none', 
                  fontWeight: 'bold', 
                  color: 'primary.main',
                  transition: 'color 0.2s ease',
                  '&:hover': {
                    color: 'primary.dark',
                  }
                }}>
                  Log in
                </Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Register;