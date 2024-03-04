/**
 * RoomList Component
 *
 * @module features/rooms/components/RoomList
 */

import { useMemo } from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  Typography,
  Box,
  Skeleton,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Chat as ChatIcon,
} from '@mui/icons-material';
import { useRooms } from '../hooks/useRooms';
import { useCreateRoom } from '../hooks/useCreateRoom';
import { RoomItem } from './RoomItem';
import { SearchBar } from './SearchBar';
import { useRoomsStore } from '../stores/roomsStore';
import type { Room } from '../types';

export const RoomList: React.FC = () => {
  const { rooms, isLoading, error, searchQuery, setSearchQuery, refresh } =
    useRooms();
  const { openModal } = useCreateRoom();
  const activeRoomId = useRoomsStore((state) => state.activeRoomId);
  const setActiveRoom = useRoomsStore((state) => state.setActiveRoom);

  const uniqueRooms = useMemo<Room[]>(() => {
    const map = new Map<string, Room>();

    rooms.forEach((room) => {
      if (!map.has(room.id)) {
        map.set(room.id, room);
      }
    });

    return Array.from(map.values());
  }, [rooms]);

  if (isLoading && rooms.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Skeleton
          variant="rectangular"
          height={40}
          sx={{ mb: 2, borderRadius: 1 }}
        />
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton
            key={i}
            variant="rectangular"
            height={60}
            sx={{ mb: 1, borderRadius: 1 }}
          />
        ))}
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error" gutterBottom>
          خطا در بارگذاری اتاق‌ها
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {error.message}
        </Typography>
        <Tooltip title="تلاش مجدد">
          <IconButton onClick={refresh} color="primary" size="large">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#f0f2f5',
      }}
    >
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ChatIcon color="primary" />
            <Typography variant="h6" fontWeight="bold">
              اتاق‌ها
            </Typography>
            {uniqueRooms.length > 0 && (
              <Typography variant="caption" color="text.secondary">
                ({uniqueRooms.length})
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="ایجاد اتاق جدید">
              <IconButton onClick={openModal} color="primary">
                <AddIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="بروزرسانی">
              <IconButton
                onClick={refresh}
                disabled={isLoading}
                sx={{
                  opacity: isLoading ? 0.5 : 1,
                  transition: 'opacity 0.2s ease',
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {uniqueRooms.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center', mt: 4 }}>
            {searchQuery ? (
              <>
                <Typography color="text.secondary" gutterBottom>
                  اتاقی با عنوان "{searchQuery}" یافت نشد
                </Typography>
                <Typography
                  variant="body2"
                  color="primary"
                  sx={{ cursor: 'pointer', mt: 1 }}
                  onClick={() => setSearchQuery('')}
                >
                  پاک کردن جستجو
                </Typography>
              </>
            ) : (
              <>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  هنوز اتاقی ایجاد نشده
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  اولین اتاق چت خود را ایجاد کنید
                </Typography>
                <Tooltip title="ایجاد اتاق جدید">
                  <IconButton
                    onClick={openModal}
                    color="primary"
                    size="large"
                    sx={{
                      mt: 2,
                      bgcolor: 'primary.main',
                      color: 'white',
                      width: 64,
                      height: 64,
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                    }}
                  >
                    <AddIcon sx={{ fontSize: 32 }} />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
        ) : (
          <List disablePadding>
            {uniqueRooms.map((room) => (
              <ListItem key={room.id} disablePadding>
                <ListItemButton
                  selected={activeRoomId === room.id}
                  onClick={() => setActiveRoom(room.id)}
                  sx={{
                    '&.Mui-selected': {
                      bgcolor: 'rgba(37, 211, 102, 0.08)',
                      borderRight: '3px solid',
                      borderColor: 'primary.main',
                      '&:hover': {
                        bgcolor: 'rgba(37, 211, 102, 0.12)',
                      },
                    },
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  <RoomItem room={room} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Paper>
  );
};
