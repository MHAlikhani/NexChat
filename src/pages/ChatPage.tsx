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
  const { user, signOut, updateDisplayName } = useAuth();
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
      {/* Aurora Background */}
      <div className="aurora-background">
        <div className="aurora-orb"></div>
      </div>

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
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 0,
          }}
        >
          <Toolbar sx={{ minHeight: '64px !important', px: 3 }}>
            <Avatar
              src={user?.photoURL || undefined}
              sx={{
                ml: 2,
                width: 44,
                height: 44,
                background: 'linear-gradient(135deg, #7000FF 0%, #00F0FF 100%)',
                color: '#0B0F19',
                fontWeight: 700,
                border: '2px solid rgba(255,255,255,0.1)',
                boxShadow: '0 4px 12px rgba(112, 0, 255, 0.3)',
              }}
            >
              {user?.displayName?.charAt(0)}
            </Avatar>
            <Box
              sx={{
                flex: 1,
                mr: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Box>
                <Typography
                  variant="subtitle1"
                  fontWeight="700"
                  sx={{ color: '#F8FAFC', letterSpacing: '-0.01em' }}
                >
                  {user?.displayName}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: '#00F0FF', fontWeight: 600 }}
                >
                  {t('auth.online')}
                </Typography>
              </Box>
              <Tooltip title={t('auth.editName')}>
                <IconButton
                  onClick={() => setEditNameOpen(true)}
                  size="small"
                  sx={{
                    color: '#94A3B8',
                    '&:hover': {
                      bgcolor: 'rgba(0, 240, 255, 0.1)',
                      color: '#00F0FF',
                    },
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Language Selector */}
            <Tooltip title={t('auth.language')}>
              <IconButton
                onClick={(e) => setLanguageMenuAnchor(e.currentTarget)}
                sx={{
                  color: '#94A3B8',
                  ml: 1,
                  bgcolor: 'rgba(112, 0, 255, 0.08)',
                  border: '1px solid rgba(112, 0, 255, 0.15)',
                  '&:hover': {
                    bgcolor: 'rgba(112, 0, 255, 0.15)',
                    color: '#9D4DFF',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
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
                    borderRadius: 3,
                    bgcolor: 'rgba(15, 23, 42, 0.95)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    minWidth: 150,
                    mt: 1,
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
                      py: 1.5,
                      color: '#F8FAFC',
                      '&:hover': { bgcolor: 'rgba(0, 240, 255, 0.08)' },
                    }}
                  >
                    <ListItemText primary={name} />
                    {i18n.language === code && (
                      <ListItemIcon sx={{ color: '#00F0FF', ml: 1 }}>
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
                  py: 1.5,
                  color: '#FF6B6B',
                  '&:hover': { bgcolor: 'rgba(255, 107, 107, 0.08)' },
                }}
              >
                <ListItemIcon sx={{ color: '#FF6B6B' }}>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={t('auth.logout')} />
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* Main content */}
        <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Sidebar - Room list */}
          <Box
            sx={{
              width: { xs: '100%', md: 380 },
              display: { xs: activeRoomId ? 'none' : 'block', md: 'block' },
              borderLeft: { md: '1px solid rgba(255,255,255,0.08)' },
              bgcolor: 'rgba(15, 23, 42, 0.4)',
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
              bgcolor: 'rgba(15, 23, 42, 0.2)',
              backdropFilter: 'blur(10px)',
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
                  gap: 3,
                }}
              >
                <Box
                  sx={{
                    p: 3,
                    borderRadius: '50%',
                    bgcolor: 'rgba(0, 240, 255, 0.05)',
                    border: '1px solid rgba(0, 240, 255, 0.1)',
                    boxShadow: '0 0 40px rgba(0, 240, 255, 0.1)',
                    animation: 'pulse-glow 3s infinite',
                  }}
                >
                  <Typography
                    variant="h2"
                    sx={{ fontSize: '4rem' }}
                  >
                    💬
                  </Typography>
                </Box>
                <Typography
                  variant="h4"
                  fontWeight="800"
                  sx={{
                    color: '#F8FAFC',
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
                  variant="body1"
                  sx={{
                    color: '#94A3B8',
                    textAlign: 'center',
                    maxWidth: 400,
                    lineHeight: 1.7,
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
