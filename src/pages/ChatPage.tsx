import { Box, AppBar, Toolbar, IconButton, Avatar, Typography } from '@mui/material';
import { Logout as LogoutIcon } from '@mui/icons-material';
import { useAuth } from '@/features/auth';
import { RoomList, CreateRoomModal } from '@/features/rooms';
import { ChatWindow } from '@/features/chat/components/ChatWindow';
import { useRoomsStore } from '@/features/rooms/stores/roomsStore';

export default function ChatPage() {
  const { user, signOut } = useAuth();
  const activeRoomId = useRoomsStore((state) => state.activeRoomId);
  const setActiveRoom = useRoomsStore((state) => state.setActiveRoom);

  return (
    <>
      {/* Aurora Background */}
      <div className="aurora-background">
        <div className="aurora-orb"></div>
      </div>

      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', position: 'relative', zIndex: 1 }}>
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
            <Box sx={{ flex: 1, mr: 2 }}>
              <Typography variant="subtitle1" fontWeight="700" sx={{ color: '#F8FAFC', letterSpacing: '-0.01em' }}>
                {user?.displayName}
              </Typography>
              <Typography variant="caption" sx={{ color: '#00F0FF', fontWeight: 600 }}>
                آنلاین
              </Typography>
            </Box>
            <IconButton 
              onClick={signOut} 
              sx={{
                color: '#94A3B8',
                bgcolor: 'rgba(255, 107, 107, 0.08)',
                border: '1px solid rgba(255, 107, 107, 0.15)',
                '&:hover': { 
                  bgcolor: 'rgba(255, 107, 107, 0.15)', 
                  color: '#FF6B6B',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              <LogoutIcon />
            </IconButton>
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
                  <Typography variant="h2" sx={{ fontSize: '4rem' }}>💬</Typography>
                </Box>
                <Typography variant="h4" fontWeight="800" sx={{ color: '#F8FAFC', letterSpacing: '-0.02em', textAlign: 'center' }}>
                  به <span className="text-gradient">NexChat</span> خوش آمدید
                </Typography>
                <Typography variant="body1" sx={{ color: '#94A3B8', textAlign: 'center', maxWidth: 400, lineHeight: 1.7 }}>
                  یک اتاق را انتخاب کنید یا اتاق جدید ایجاد کنید و تجربه‌ای مدرن از گفتگو را آغاز نمایید.
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Create Room Modal */}
        <CreateRoomModal />
      </Box>
    </>
  );
}