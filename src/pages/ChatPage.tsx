import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  Logout as LogoutIcon,
  Edit as EditIcon,
  Language as LanguageIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { useAuth, EditNameModal } from '@/features/auth';
import { RoomList, CreateRoomModal } from '@/features/rooms';
import { ChatWindow } from '@/features/chat/components/ChatWindow';
import { useRoomsStore } from '@/features/rooms/stores/roomsStore';
import { supportedLanguages, type SupportedLanguage } from '@/lib/i18n';

export default function ChatPage() {
  const { t, i18n } = useTranslation();
  const { user, signOut } = useAuth();
  const activeRoomId = useRoomsStore((state) => state.activeRoomId);
  const setActiveRoom = useRoomsStore((state) => state.setActiveRoom);

  const [editNameOpen, setEditNameOpen] = useState(false);
  const [languageMenuAnchor, setLanguageMenuAnchor] = useState<null | HTMLElement>(
    null
  );

  const handleLanguageChange = (lang: SupportedLanguage) => {
    i18n.changeLanguage(lang);
    setLanguageMenuAnchor(null);
  };

  return (
    <>
      {/* Ambient Background */}
      <div className="aurora-background" />

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Top bar with user info */}
        <AppBar
          position="static"
          elevation={0}
          className="glass-panel"
          sx={{
            borderBottom: '0.5px solid rgba(255,255,255,0.1)',
            borderRadius: 0,
          }}
        >
          <Toolbar sx={{ minHeight: '56px !important', px: 2 }}>
            <Avatar
              src={user?.photoURL || undefined}
              sx={{
                ml: 1,
                width: 38,
                height: 38,
                background: 'linear-gradient(135deg, #5E5CE6 0%, #0A84FF 100%)',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            >
              {user?.displayName?.charAt(0)}
            </Avatar>
            <Box
              sx={{
                flex: 1,
                ml: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
              }}
            >
              <Box>
                <Typography
                  variant="subtitle1"
                  fontWeight="600"
                  sx={{ color: '#FFFFFF', letterSpacing: '-0.01em', fontSize: '0.9rem' }}
                >
                  {user?.displayName}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: '#30D158', fontWeight: 500, fontSize: '0.7rem' }}
                >
                  {t('auth.online')}
                </Typography>
              </Box>
              <Tooltip title={t('auth.editName')}>
                <IconButton
                  onClick={() => setEditNameOpen(true)}
                  size="small"
                  sx={{
                    color: '#8E8E93',
                    width: 28,
                    height: 28,
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.08)',
                      color: '#FFFFFF',
                    },
                  }}
                >
                  <EditIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Language Selector */}
            <Tooltip title={t('auth.language')}>
              <IconButton
                onClick={(e) => setLanguageMenuAnchor(e.currentTarget)}
                sx={{
                  color: '#8E8E93',
                  ml: 0.5,
                  bgcolor: 'rgba(94, 92, 230, 0.08)',
                  '&:hover': {
                    bgcolor: 'rgba(94, 92, 230, 0.15)',
                    color: '#5E5CE6',
                  },
                  transition: 'background-color 0.15s ease',
                }}
              >
                <LanguageIcon />
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={languageMenuAnchor}
              open={Boolean(languageMenuAnchor)}
              onClose={() => setLanguageMenuAnchor(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              slotProps={{
                paper: {
                  sx: {
                    borderRadius: 2.5,
                    bgcolor: 'rgba(28, 28, 30, 0.95)',
                    backdropFilter: 'blur(30px)',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                    border: '0.5px solid rgba(255,255,255,0.1)',
                    minWidth: 140,
                    mt: 0.5,
                  },
                },
              }}
            >
              {(Object.entries(supportedLanguages) as [SupportedLanguage, typeof supportedLanguages[SupportedLanguage]][]).map(
                ([code, { name }]) => (
                  <MenuItem
                    key={code}
                    onClick={() => handleLanguageChange(code)}
                    sx={{
                      py: 1.25,
                      color: '#FFFFFF',
                      '&:hover': { bgcolor: 'rgba(10, 132, 255, 0.1)' },
                    }}
                  >
                    <ListItemText primary={name} primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }} />
                    {i18n.language === code && (
                      <ListItemIcon sx={{ color: '#0A84FF', ml: 1 }}>
                        <CheckIcon fontSize="small" />
                      </ListItemIcon>
                    )}
                  </MenuItem>
                )
              )}
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
              <MenuItem
                onClick={signOut}
                sx={{
                  py: 1.25,
                  color: '#FF453A',
                  '&:hover': { bgcolor: 'rgba(255, 69, 58, 0.1)' },
                }}
              >
                <ListItemIcon sx={{ color: '#FF453A' }}>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={t('auth.logout')} primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }} />
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* Main content */}
        <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Sidebar - Room list */}
          <Box
            sx={{
              width: { xs: '100%', md: 360 },
              display: { xs: activeRoomId ? 'none' : 'block', md: 'block' },
              borderLeft: { md: '0.5px solid rgba(255,255,255,0.1)' },
              bgcolor: 'rgba(28, 28, 30, 0.4)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <RoomList />
          </Box>

          {/* Chat window */}
          <Box
            sx={{
              flex: 1,
              display: { xs: activeRoomId ? 'flex' : 'none', md: 'flex' },
              flexDirection: 'column',
              bgcolor: 'rgba(0, 0, 0, 0.2)',
            }}
          >
            {activeRoomId ? (
              <ChatWindow
                roomId={activeRoomId}
                onBack={() => setActiveRoom(null)}
              />
            ) : (
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '22px',
                    background: 'linear-gradient(135deg, #0A84FF 0%, #5E5CE6 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1,
                  }}
                >
                  <Typography
                    variant="h2"
                    sx={{ fontSize: '2.5rem', lineHeight: 1 }}
                  >
                    💬
                  </Typography>
                </Box>
                <Typography
                  variant="h5"
                  fontWeight="700"
                  sx={{
                    color: '#FFFFFF',
                    letterSpacing: '-0.02em',
                    textAlign: 'center',
                  }}
                >
                  <Trans
                    i18nKey="auth.welcomeTo"
                    components={{
                      gradient: <span className="text-gradient" />,
                    }}
                  />
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#8E8E93',
                    textAlign: 'center',
                    maxWidth: 360,
                    lineHeight: 1.5,
                  }}
                >
                  {t('auth.loginSubtitle')}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Create Room Modal */}
        <CreateRoomModal />

        {/* Edit Name Modal */}
        <EditNameModal
          open={editNameOpen}
          onClose={() => setEditNameOpen(false)}
        />
      </Box>
    </>
  );
}
