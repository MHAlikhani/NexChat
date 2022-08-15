/**
 * RoomList Component
 *
 * نمایش لیست اتاق‌ها با جستجو و فیلتر
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
import { Add as AddIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { useRooms } from '../hooks/useRooms';
import { useCreateRoom } from '../hooks/useCreateRoom';
import { RoomItem } from './RoomItem';
import { SearchBar } from './SearchBar';
import { useRoomsStore } from '../stores/roomsStore';

export const RoomList: React.FC = () => {
  const { rooms, isLoading, error, searchQuery, setSearchQuery, refresh } = useRooms();
  const { openModal } = useCreateRoom();
  const setActiveRoom = useRoomsStore((state) => state.setActiveRoom);
  const activeRoomId = useRoomsStore((state) => state.activeRoomId);

  /**
   * Memoize filtered rooms to prevent unnecessary re-renders
   */
  const filteredRooms = useMemo(() => rooms, [rooms]);

  /**
   * Loading Skeleton
   */
  if (isLoading) {
    return (
      <Box sx={{ p: 2 }}>
        <Skeleton variant="rectangular" height={40} sx={{ mb: 2, borderRadius: 1 }} />
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} variant="rectangular" height={60} sx={{ mb: 1, borderRadius: 1 }} />
        ))}
      </Box>
    );
  }

  /**
   * Error State
   */
  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error" gutterBottom>
          خطا در بارگذاری اتاق‌ها
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {error.message}
        </Typography>
        <IconButton onClick={refresh} color="primary">
          <RefreshIcon />
        </IconButton>
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
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" fontWeight="bold">
            اتاق‌ها
          </Typography>
          <Box>
            <Tooltip title="ایجاد اتاق جدید">
              <IconButton onClick={openModal} color="primary">
                <AddIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="بروزرسانی">
              <IconButton onClick={refresh}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </Box>

      {/* Room List */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {filteredRooms.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              {searchQuery ? 'اتاقی یافت نشد' : 'هنوز اتاقی ایجاد نشده'}
            </Typography>
            {!searchQuery && (
              <Typography
                variant="body2"
                color="primary"
                sx={{ cursor: 'pointer', mt: 1 }}
                onClick={openModal}
              >
                اولین اتاق را ایجاد کنید
              </Typography>
            )}
          </Box>
        ) : (
          <List disablePadding>
            {filteredRooms.map((room) => (
              <ListItem key={room.id} disablePadding>
                <ListItemButton
                  selected={activeRoomId === room.id}
                  onClick={() => setActiveRoom(room.id)}
                  sx={{
                    '&.Mui-selected': {
                      bgcolor: 'primary.light',
                      '&:hover': {
                        bgcolor: 'primary.light',
                      },
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