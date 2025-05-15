import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Box, CircularProgress, Typography, Button } from '@mui/material';

interface ProtectedRouteProps {
  redirectPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  redirectPath = '/login'
}) => {
  const { isAuthenticated, isLoading, user, retryAuthCheck } = useAuth();
  const location = useLocation();
  const [showRetry, setShowRetry] = React.useState<boolean>(false);
  const [retryCount, setRetryCount] = React.useState<number>(0);
  const [redirectDelay, setRedirectDelay] = React.useState<boolean>(false);
  const redirectTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Log auth state for debugging
  React.useEffect(() => {
    console.log('ProtectedRoute state:', { 
      isAuthenticated, 
      isLoading, 
      path: location.pathname,
      showRetry,
      redirectDelay
    });
  }, [isAuthenticated, isLoading, location.pathname, showRetry, redirectDelay]);

  // Handle delayed redirect and retry mechanism
  React.useEffect(() => {
    // Clear existing timeouts
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
      redirectTimeoutRef.current = null;
    }
    
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    // Only set up timers if we're not loading and not authenticated
    if (!isLoading && !isAuthenticated) {
      console.log('Setting up redirect delay');
      
      // Set a delay before showing the actual redirect
      redirectTimeoutRef.current = setTimeout(() => {
        console.log('Redirect delay finished, allowing redirect');
        setRedirectDelay(true);
      }, 800); // Short delay to prevent UI flashing

      // Show retry option if still not authenticated after a longer delay
      retryTimeoutRef.current = setTimeout(() => {
        if (!isAuthenticated) {
          console.log('Auth taking too long, showing retry option');
          setShowRetry(true);
        }
      }, 3000); // 3 seconds
    }
    
    // Reset retry UI if we become authenticated
    if (isAuthenticated) {
      setShowRetry(false);
      setRedirectDelay(false);
    }

    // Cleanup on unmount or deps change
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
        redirectTimeoutRef.current = null;
      }
      
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
  }, [isLoading, isAuthenticated]);

  // Handle retry action
  const handleRetry = async () => {
    setShowRetry(false);
    setRedirectDelay(false);
    setRetryCount(prev => prev + 1);
    
    try {
      console.log('Manually retrying authentication check');
      
      // Use the retry function from AuthContext if available
      if (retryAuthCheck) {
        await retryAuthCheck();
      } else {
        // Fallback to page refresh if retryAuthCheck isn't available
        window.location.reload();
      }
    } catch (error) {
      console.error('Retry authentication failed:', error);
      // Show retry UI again after failure
      setShowRetry(true);
    }
  };

  // Show loading or retry UI
  if (isLoading || (!isAuthenticated && !redirectDelay)) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        height="100vh"
        gap={2}
      >
        <CircularProgress />
        
        <Typography variant="body2" color="textSecondary">
          {isLoading 
            ? 'Verifying authentication...' 
            : 'Preparing to redirect...'}
        </Typography>
        
        {showRetry && !isLoading && (
          <Box textAlign="center" mt={2}>
            <Typography variant="body2" color="error" gutterBottom>
              Authentication verification is taking longer than expected
            </Typography>
            <Button 
              variant="outlined" 
              color="primary"
              onClick={handleRetry}
              disabled={isLoading}
            >
              Retry Authentication
            </Button>
          </Box>
        )}
      </Box>
    );
  }

  // Handle unauthenticated state with redirect
  if (!isAuthenticated) {
    console.log('Redirecting to login from protected route:', location.pathname);
    
    // Store the attempted path for redirecting back after login
    if (location.pathname !== redirectPath) {
      sessionStorage.setItem('redirectPath', location.pathname);
      
      // Store debug information about the auth failure
      const authFailureInfo = {
        timestamp: new Date().toISOString(),
        path: location.pathname,
        referrer: document.referrer,
        retryCount,
        userPresent: !!user,
        failureReason: sessionStorage.getItem('authFailureReason') || 'Unknown'
      };
      
      console.log('Auth failure debug info:', authFailureInfo);
      sessionStorage.setItem('lastAuthFailureInfo', JSON.stringify(authFailureInfo));
    }
    
    return <Navigate to={redirectPath} replace state={{ from: location }} />;
  }

  // User is authenticated, render the protected content
  return <Outlet />;
};

export default ProtectedRoute; 