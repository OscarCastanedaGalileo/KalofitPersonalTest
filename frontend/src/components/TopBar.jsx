import { useTheme, alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router';
import { useProfile } from '../hooks/useProfile';

const BellIcon = (props) => (
  <svg viewBox="0 0 24 24" width="25" height="25" fill="none" {...props}>
    <path d="M15 17H9c-1.1 0-2-.9-2-2v-3.2c0-2.7 1.8-4.9 4.3-5.5V5a1.7 1.7 0 0 1 3.4 0v1.3c2.5.6 4.3 2.8 4.3 5.5V15c0 1.1-.9 2-2 2ZM12 21a2.2 2.2 0 0 0 2.2-2.2h-4.4A2.2 2.2 0 0 0 12 21Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function TopBar() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { profile } = useProfile();

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const rootStyle = {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: alpha(theme.palette.background.default, 0.08),
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',

    paddingTop: 'calc(16px + env(safe-area-inset-top, 0px))',
    paddingBottom: '12px',
    paddingLeft: '8px',
    paddingRight: '8px',
    display: 'flex',
    alignItems: 'center',
  };

  const leftStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    cursor: 'pointer',
  };

  const nameStyle = {
    color: theme.palette.text.primary,
    fontWeight: 600,
    cursor: 'pointer',
  };

  const actionsStyle = {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  };

  const btnStyle = {
    position: 'relative',
    width: 34,
    height: 34,
    border: 'none',
    borderRadius: 999,
    display: 'grid',
    placeItems: 'center',
    background: 'transparent',
    color: theme.palette.text.primary,
    cursor: 'pointer',
  };

  // no leídas
  const dotStyle = {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 999,
    background: theme.palette.common.white,
    boxShadow: `0 0 0 2px ${theme.palette.background.default}`,
    display: 'none',
  };

  return (
    <div style={rootStyle}>
      {/* Foto Perfil y Nombre */}
      <div style={leftStyle} onClick={handleProfileClick}>
        <img
          src={profile?.photo || "https://i.pravatar.cc/64"}
          alt="avatar"
          style={{ width: 40, height: 40, borderRadius: '9999px', cursor: 'pointer' }}
        />
        <div style={nameStyle}>
          {profile?.user?.name || 'Usuario'}
        </div>
      </div>

      {/* Notificaciones */}
      <div style={actionsStyle}>
        <button
          type="button"
          aria-label="Notifications"
          title="Notifications"
          style={btnStyle}
          onClick={() => console.log('open notifications')}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <BellIcon />
          <span style={dotStyle} />
        </button>
      </div>
    </div>
  );
}
