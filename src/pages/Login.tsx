import React from 'react';
import { TextField, Button, Typography, Box, Container, Paper, Alert, CircularProgress, Checkbox, FormControlLabel } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const Login = () => {
  // Form state
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  
  // Error state
  const [emailError, setEmailError] = React.useState('');
  const [passwordError, setPasswordError] = React.useState('');
  
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
  const { login, isLoading, error, clearError, setError } = useAuth();
  
  // Navigation
  const navigate = useNavigate();
  
  // Validate form
  const validateForm = () => {
    let isValid = true;
    
    // Reset errors
    setEmailError('');
    setPasswordError('');
    
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
    }
    
    return isValid;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Don't need to set loading state, AuthContext handles this
    clearError();
    
    // Validate form inputs first
    if (!validateForm()) {
      return;
    }
    
    try {
      const result = await login({ email, password });
      console.log('Login result:', result);
      
      if (result && result.success === true) {
        navigate('/');
      } else {
        // Make sure we display the error message from the response
        setError(result?.error || 'Login failed. Please check your credentials.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'An error occurred during login. Please try again.');
    }
    // Don't need to handle loading state here, AuthContext does this
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
      
      {/* Right side - Login form */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        p: 4,
        position: 'relative',
        bgcolor: 'background.paper'
      }}>
        

        
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          maxWidth: 400, 
          mx: 'auto', 
          width: '100%',
          textAlign: 'center'
        }}>
          {/* Main Branding */}
          <Box sx={{ mb: 6 }}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 'bold',
                background: 'linear-gradient(90deg, #4F46E5 0%, #7C3AED 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
                letterSpacing: '-0.5px',
                lineHeight: 1.2,
                color: 'primary.main',
              }}
            >
              INSEAT
            </Typography>
            {/* <Typography 
              variant="h6" 
              sx={{ 
                color: 'primary.main',
                fontWeight: 600,
                letterSpacing: '1px',
                mb: 1,
                textTransform: 'uppercase',
                fontSize: '1.1rem'
              }}
            >
              Admin Panel
            </Typography> */}
            <Box 
              sx={{ 
                width: 60, 
                height: 4, 
                background: 'linear-gradient(90deg, #4F46E5 0%, #7C3AED 100%)',
                mx: 'auto',
                borderRadius: 2,
                opacity: 0.8
              }}
            />
          </Box>
          
          {/* Sign In Section */}
          <Box sx={{ mb: 4 }}>
            <Typography 
              component="h1" 
              variant="h5" 
              sx={{ 
                fontWeight: 600, 
                mb: 1,
                color: 'text.primary',
                fontSize: '1.5rem'
              }}
            >
              Sign In
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                fontSize: '0.95rem'
              }}
            >
              Welcome back! Please login to your account
            </Typography>
          </Box>
          
  
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
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
              autoComplete="current-password"
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
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <FormControlLabel
                control={<Checkbox value="remember" color="primary" size="small" />}
                label={<Typography variant="body2">Remember me</Typography>}
              />
              <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="primary">
                  Forgot password?
                </Typography>
              </Link>
            </Box>
            
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
              {isLoading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
            

            

          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;