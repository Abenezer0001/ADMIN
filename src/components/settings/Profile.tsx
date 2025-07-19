import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  IconButton,
  Avatar,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import { PhotoCamera as PhotoCameraIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/apiUtils';

interface ProfileForm {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  profileImage: string;
}

const Profile: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const [form, setForm] = useState<ProfileForm>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    profileImage: '',
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load user data when component mounts or user changes
  useEffect(() => {
    if (user) { 
      console.log('Loading user data:', user);
      setForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        profileImage: user.profileImage || '',
      });
    }
  }, [user]);

  // Clear message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleChange = (field: keyof ProfileForm) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await api.put('/auth/profile', {
        firstName: form.firstName,
        lastName: form.lastName,
        phoneNumber: form.phoneNumber,
      });

      console.log('Raw API response:', response);

      // The response is the actual data (not wrapped in a response object)
      if (response && (response as any).success !== false) {
        console.log('Profile updated successfully:', response);
        
        // Update form with the response data
        if ((response as any).user) {
          const userUpdate = (response as any).user;
          setForm((prev: ProfileForm) => ({
            ...prev,
            firstName: userUpdate.firstName,
            lastName: userUpdate.lastName,
            phoneNumber: userUpdate.phoneNumber,
          }));
          
          // Update user context with new data
          if (updateUserProfile && user) {
            updateUserProfile({ ...user, ...userUpdate });
          }
        } else {
          // If no user object in response, update with current form data
          if (updateUserProfile && user) {
            updateUserProfile({ 
              ...user, 
              firstName: form.firstName,
              lastName: form.lastName,
              phoneNumber: form.phoneNumber
            });
          }
        }
        
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        setMessage({ type: 'error', text: (response as any)?.message || 'Failed to update profile.' });
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      // Don't show error message here since apiUtils already shows a toast
      // setMessage({ type: 'error', text: error || 'Failed to update profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image size must be less than 5MB.' });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select an image file.' });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('profileImage', file);


      const response = await api.post('/auth/profile/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Image upload raw response:', response);
      
      if (response && (response as any).imageUrl) {
        const imageUrl = (response as any).imageUrl;
        console.log('Profile image uploaded successfully:', imageUrl);
        
        // Ensure the image URL is properly formatted
        const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${window.location.origin}${imageUrl}`;
        console.log('Full image URL:', fullImageUrl);
        
        setForm((prev: ProfileForm) => ({ ...prev, profileImage: fullImageUrl }));
        
        // Update user context with new image
        if (updateUserProfile && user) {
          updateUserProfile({ ...user, profileImage: fullImageUrl });
        }
        setMessage({ type: 'success', text: 'Profile image updated successfully!' });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      // Don't show error message here since apiUtils already shows a toast
      // setMessage({ type: 'error', text: 'Failed to upload image. Please try again.' });
    } finally {
      setUploading(false);
    }
  };

  // Debug: Log form state
  console.log('Current form state:', form);
  console.log('Current user:', user);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Edit Profile
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Message Alert */}
          {message && (
            <Grid item xs={12}>
              <Alert severity={message.type} sx={{ mb: 2 }}>
                {message.text}
              </Alert>
            </Grid>
          )}
          {/* Profile Picture */}
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={form.profileImage || ''}
                sx={{
                  width: 100,
                  height: 100,
                  fontSize: '2rem',
                }}
                onError={(e: any) => {
                  console.error('Avatar image failed to load:', form.profileImage);
                  e.currentTarget.src = '';
                }}
              >
                {form.firstName?.[0] || ''}{form.lastName?.[0] || ''}
              </Avatar>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="icon-button-file"
                type="file"
                onChange={handleImageUpload}
              />
              <label htmlFor="icon-button-file">
                <IconButton
                  color="primary"
                  aria-label="upload picture"
                  component="span"
                  sx={{
                    position: 'absolute',
                    bottom: -8,
                    right: -8,
                    bgcolor: 'background.paper',
                    boxShadow: 1,
                    '&:hover': { bgcolor: 'background.paper' },
                  }}
                >
                  <PhotoCameraIcon />
                </IconButton>
              </label>
            </Box>
          </Grid>

          {/* Form Fields */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="First Name"
              value={form.firstName}
              onChange={handleChange('firstName')}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Last Name"
              value={form.lastName}
              onChange={handleChange('lastName')}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Phone Number"
              value={form.phoneNumber}
              onChange={handleChange('phoneNumber')}
              type="tel"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email"
              value={form.email}
              onChange={handleChange('email')}
              type="email"
              disabled
              helperText="Email cannot be changed"
            />
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button variant="outlined" onClick={() => window.history.back()}>
                Cancel
              </Button>
              <Button 
                variant="contained" 
                onClick={handleSave}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Profile;
