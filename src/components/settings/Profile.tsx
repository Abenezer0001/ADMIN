import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  IconButton,
  Avatar,
  Grid,
} from '@mui/material';
import { PhotoCamera as PhotoCameraIcon } from '@mui/icons-material';

interface ProfileForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
}

const Profile: React.FC = () => {
  const [form, setForm] = useState<ProfileForm>({
    firstName: 'Dharma',
    lastName: 'RDJ',
    email: 'dharmardj.b@cinemacity.ae',
    phone: '',
    position: 'Administrator',
  });
<<<<<<< Updated upstream
=======
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
>>>>>>> Stashed changes

  const handleChange = (field: keyof ProfileForm) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving profile:', form);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
<<<<<<< Updated upstream
    if (file) {
      // TODO: Implement image upload
      console.log('Uploading image:', file);
=======
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

      if (response.data.success) {
        const imageUrl = response.data.imageUrl;
        console.log('Profile image uploaded successfully:', imageUrl);
        console.log('Full response:', response.data);
        
        // Ensure the image URL is properly formatted
        const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${window.location.origin}${imageUrl}`;
        console.log('Full image URL:', fullImageUrl);
        
        setForm(prev => ({ ...prev, profileImage: fullImageUrl }));
        
        // Update user context with new image
        if (updateUserProfile && user) {
          updateUserProfile({ ...user, profileImage: fullImageUrl });
        }
        setMessage({ type: 'success', text: 'Profile image updated successfully!' });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setMessage({ type: 'error', text: 'Failed to upload image. Please try again.' });
    } finally {
      setUploading(false);
>>>>>>> Stashed changes
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
          {/* Profile Picture */}
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
<<<<<<< Updated upstream
=======
                src={form.profileImage || ''}
>>>>>>> Stashed changes
                sx={{
                  width: 100,
                  height: 100,
                  fontSize: '2rem',
                }}
                onError={(e) => {
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
              label="Email"
              value={form.email}
              onChange={handleChange('email')}
              type="email"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Phone"
              value={form.phone}
              onChange={handleChange('phone')}
              type="tel"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Position"
              value={form.position}
              onChange={handleChange('position')}
            />
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button variant="outlined" onClick={() => window.history.back()}>
                Cancel
              </Button>
              <Button variant="contained" onClick={handleSave}>
                Save Changes
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Profile;
