import { Box, Typography, Button } from '@mui/material';
import { useAuth } from '@/features/auth';

export default function ChatPage() {
  const { user, signOut } = useAuth();

  return (
    <Box sx={{ minHeight: '100vh', p: 4, background: '#f0f2f5' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
        }}
      >
        <Typography variant="h4">چت‌ها</Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {user?.photoURL && (
            <img
              src={user.photoURL}
              alt={user.displayName}
              style={{ width: 40, height: 40, borderRadius: '50%' }}
            />
          )}
          <Typography>{user?.displayName}</Typography>
          <Button variant="outlined" onClick={signOut} color="error">
            خروج
          </Button>
        </Box>
      </Box>

      <Typography variant="h6" color="text.secondary">
        به زودی: لیست چت‌ها و پیام‌ها
      </Typography>
    </Box>
  );
}