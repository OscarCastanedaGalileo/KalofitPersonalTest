import React from 'react';
import { Avatar, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router';
import { useProfile } from '../hooks/useProfile';

export default function UserAvatar({
  size = 28,
  typographyVariant = "subtitle1",
  showName = true,
  spacing = 1.2,
  sx = {}
}) {
  const navigate = useNavigate();
  const { profile } = useProfile();

  const avatarSrc = profile?.photo ? `${import.meta.env.VITE_BACKEND_URL}/uploads/${profile.photo}` : "";
  const userName = profile?.user?.name || profile?.name || "Usuario";
  const avatarLetter = userName.charAt(0).toUpperCase();

  const handleClick = () => {
    navigate('/profile');
  };

  return (
    <Stack
      direction="row"
      spacing={spacing}
      alignItems="center"
      onClick={handleClick}
      sx={{
        cursor: 'pointer',
        borderRadius: 1,
        padding: '4px',
        transition: 'background-color 0.2s ease',
        '&:hover': {
          backgroundColor: 'action.hover',
        },
        ...sx
      }}
    >
      <Avatar
        src={avatarSrc}
        sx={{ width: size, height: size }}
      >
        {avatarLetter}
      </Avatar>
      {showName && (
        <Typography variant={typographyVariant}>
          {userName}
        </Typography>
      )}
    </Stack>
  );
}
