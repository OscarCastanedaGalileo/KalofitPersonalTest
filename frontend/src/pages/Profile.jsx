import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Paper,
  Stack,
  Alert,
  CircularProgress,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router';
import { getProfile, updateProfile } from '../api';

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dailyKcalGoal: '',
    dailyWaterGoal: '',
    birthDate: '',
    weight: '',
    height: '',
    gender: '',
    activityLevel: '',
    photo: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await getProfile();
        setFormData({
          name: profile.user?.name || '',
          email: profile.user?.email || '',
          dailyKcalGoal: profile.dailyKcalGoal?.toString() || '',
          dailyWaterGoal: profile.dailyWaterGoal?.toString() || '',
          birthDate: profile.birthDate ? new Date(profile.birthDate).toISOString().split('T')[0] : '',
          weight: profile.weight?.toString() || '',
          height: profile.height?.toString() || '',
          gender: profile.gender || '',
          activityLevel: profile.activityLevel || '',
          photo: profile.photo || '',
        });
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Error al cargar el perfil');
      } finally {
        setInitialLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Convertir imagen a base64 para preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          photo: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    try {
      const data = {
        name: formData.name,
        dailyKcalGoal: formData.dailyKcalGoal ? parseInt(formData.dailyKcalGoal) : null,
        dailyWaterGoal: formData.dailyWaterGoal ? parseInt(formData.dailyWaterGoal) : null,
        birthDate: formData.birthDate || null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        height: formData.height ? parseFloat(formData.height) : null,
        gender: formData.gender || null,
        activityLevel: formData.activityLevel || null,
        photo: formData.photo || null,
      };

      await updateProfile(data);
      setSuccess(true);
      setTimeout(() => {
        navigate('/reports');
      }, 1500);

    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/reports');
  };

  if (success) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'background.default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2
        }}
      >
        <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 400 }}>
          <Typography variant="h5" color="primary" sx={{ mb: 2 }}>
            Profile updated successfully!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Redirecting...
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 2, pb: 10 }}>
      <Box
        sx={{
          mx: "auto",
          maxWidth: 600,
        }}
      >
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <IconButton onClick={handleBack} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6">
            Edit Profile
          </Typography>
        </Box>

        {/* Form */}
        <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
          {initialLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
              <CircularProgress />
              <Typography variant="body1" sx={{ ml: 2 }}>
                Loading profile...
              </Typography>
            </Box>
          ) : (
            <>
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  {/* Foto de Perfil */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      src={formData.photo}
                      sx={{ width: 100, height: 100 }}
                    >
                      {formData.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<PhotoCamera />}
                    >
                      Change Photo
                      <input
                        hidden
                        accept="image/*"
                        type="file"
                        onChange={handlePhotoChange}
                      />
                    </Button>
                  </Box>

                  {/* Información Básica */}
                  <TextField
                    label="Name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    fullWidth
                  />

                  <TextField
                    label="Email"
                    type="email"
                    value={formData.email}
                    disabled
                    fullWidth
                    helperText="Email cannot be changed"
                  />

                  {/* Información Física */}
                  <TextField
                    label="Daily Calorie Goal (kcal)"
                    type="number"
                    value={formData.dailyKcalGoal}
                    onChange={(e) => handleInputChange('dailyKcalGoal', e.target.value)}
                    fullWidth
                    inputProps={{ min: 500, max: 10000 }}
                  />

                  <TextField
                    label="Daily Water Goal (ml)"
                    type="number"
                    value={formData.dailyWaterGoal}
                    onChange={(e) => handleInputChange('dailyWaterGoal', e.target.value)}
                    fullWidth
                    inputProps={{ min: 500, max: 10000 }}
                    helperText="Recommended daily water intake in milliliters"
                  />

                  <TextField
                    label="Date of Birth"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => handleInputChange('birthDate', e.target.value)}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      label="Weight (kg)"
                      type="number"
                      value={formData.weight}
                      onChange={(e) => handleInputChange('weight', e.target.value)}
                      fullWidth
                      inputProps={{ min: 20, max: 300, step: 0.1 }}
                    />

                    <TextField
                      label="Height (cm)"
                      type="number"
                      value={formData.height}
                      onChange={(e) => handleInputChange('height', e.target.value)}
                      fullWidth
                      inputProps={{ min: 50, max: 250 }}
                    />
                  </Box>

                  <FormControl fullWidth>
                    <InputLabel>Gender</InputLabel>
                    <Select
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                    >
                      <MenuItem value="">
                        <em>Not specified</em>
                      </MenuItem>
                      <MenuItem value="male">Male</MenuItem>
                      <MenuItem value="female">Female</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Activity Level</InputLabel>
                    <Select
                      value={formData.activityLevel}
                      onChange={(e) => handleInputChange('activityLevel', e.target.value)}
                    >
                      <MenuItem value="">
                        <em>Not specified</em>
                      </MenuItem>
                      <MenuItem value="sedentary">Sedentary</MenuItem>
                      <MenuItem value="light">Light</MenuItem>
                      <MenuItem value="moderate">Moderate</MenuItem>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="very_active">Very Active</MenuItem>
                    </Select>
                    <FormHelperText>
                      Helps better estimate your calorie needs
                    </FormHelperText>
                  </FormControl>

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{ mt: 2 }}
                  >
                    {loading ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={20} />
                        Updating...
                      </Box>
                    ) : (
                      'Update Profile'
                    )}
                  </Button>
                </Stack>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Profile;
