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
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#f0f2f5' }}>
      {/* Top bar with user info */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar sx={{ minHeight: '56px !important' }}>
          <Avatar src={user?.photoURL || undefined} sx={{ ml: 2 }}>
            {user?.displayName?.charAt(0)}
          </Avatar>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ flex: 1 }}>
            {user?.displayName}
          </Typography>
          <IconButton onClick={signOut} color="inherit">
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
            borderLeft: { md: '1px solid' },
            borderColor: { md: 'divider' },
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
              <Typography variant="h5" color="text.secondary">
                به NexChat خوش آمدید 👋
              </Typography>
              <Typography variant="body1" color="text.secondary">
                یک اتاق را انتخاب کنید یا اتاق جدید ایجاد کنید
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Create Room Modal */}
      <CreateRoomModal />
    </Box>
  );
}