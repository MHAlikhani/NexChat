import { Box, Typography, Button, AppBar, Toolbar, IconButton, Avatar } from '@mui/material';
import { Logout as LogoutIcon, Menu as MenuIcon } from '@mui/icons-material';
import { useAuth } from '@/features/auth';
import { RoomList, CreateRoomModal } from '@/features/rooms';
import { useRoomsStore } from '@/features/rooms/stores/roomsStore';

export default function ChatPage() {
  const { user, signOut } = useAuth();
  const activeRoomId = useRoomsStore((state) => state.activeRoomId);

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f0f2f5' }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: { xs: '100%', md: 400 },
          display: { xs: activeRoomId ? 'none' : 'block', md: 'block' },
          borderRight: '1px solid',
          borderColor: 'divider',
        }}
      >
        <RoomList />
      </Box>

      {/* Main Chat Area */}
      <Box
        sx={{
          flex: 1,
          display: { xs: activeRoomId ? 'flex' : 'none', md: 'flex' },
          flexDirection: 'column',
        }}
      >
        <AppBar position="static" color="default" elevation={1}>
          <Toolbar>
            <IconButton edge="start" sx={{ mr: 2, display: { md: 'none' } }}>
              <MenuIcon />
            </IconButton>

            {user?.photoURL && (
              <Avatar src={user.photoURL} sx={{ mr: 2 }} />
            )}

            <Typography variant="h6" sx={{ flex: 1 }}>
              {user?.displayName}
            </Typography>

            <IconButton onClick={signOut} color="inherit">
              <LogoutIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#e5ddd5',
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23c9c2b8\' fill-opacity=\'0.2\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          }}
        >
          {activeRoomId ? (
            <Typography variant="h5" color="text.secondary">
              چت فعال: {activeRoomId}
            </Typography>
          ) : (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" color="text.secondary" gutterBottom>
                به NexChat خوش آمدید
              </Typography>
              <Typography variant="body1" color="text.secondary">
                یک اتاق را از لیست سمت راست انتخاب کنید یا اتاق جدید ایجاد کنید
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