/**
 * RoomList Component
 *
 * @module features/rooms/components/RoomList
 */

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  List,
  ListItem,
  ListItemButton,
  Typography,
  Box,
  Skeleton,
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
  const { t } = useTranslation();
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
          sx={{ mb: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.05)' }}
        />
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton
            key={i}
            variant="rectangular"
            height={64}
            sx={{ mb: 1, borderRadius: 2.5, bgcolor: 'rgba(255,255,255,0.03)' }}
          />
        ))}
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="#FF453A" gutterBottom fontWeight="600">
          {t('rooms.loadError')}
        </Typography>
        <Typography variant="body2" color="#8E8E93" paragraph>
          {error.message}
        </Typography>
        <Tooltip title={t('common.retry')}>
          <IconButton onClick={refresh} sx={{ color: '#0A84FF' }}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>
    );
  }

  return (
    <Box
      className="glass-panel"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 0,
        borderRight: '0.5px solid rgba(255,255,255,0.1)',
      }}
    >
      <Box
        sx={{
          p: 2,
          borderBottom: '0.5px solid rgba(255,255,255,0.1)',
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                bgcolor: 'rgba(10, 132, 255, 0.12)',
                color: '#0A84FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ChatIcon sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography
                variant="subtitle1"
                fontWeight="700"
                sx={{ color: '#FFFFFF', letterSpacing: '-0.01em', fontSize: '0.95rem' }}
              >
                {t('rooms.title')}
              </Typography>
              {uniqueRooms.length > 0 && (
                <Typography variant="caption" sx={{ color: '#636366', fontWeight: 500, fontSize: '0.7rem' }}>
                  {t('rooms.activeRooms', { count: uniqueRooms.length })}
                </Typography>
              )}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title={t('rooms.createRoom')}>
              <IconButton
                onClick={openModal}
                sx={{
                  bgcolor: 'rgba(94, 92, 230, 0.12)',
                  color: '#5E5CE6',
                  '&:hover': {
                    bgcolor: 'rgba(94, 92, 230, 0.2)',
                  },
                  transition: 'background-color 0.15s ease',
                }}
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('rooms.refresh')}>
              <IconButton
                onClick={refresh}
                disabled={isLoading}
                sx={{
                  color: '#8E8E93',
                  opacity: isLoading ? 0.5 : 1,
                  '&:hover': {
                    color: '#0A84FF',
                    bgcolor: 'rgba(10, 132, 255, 0.1)',
                  },
                  transition: 'background-color 0.15s ease',
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
        {uniqueRooms.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center', mt: 4 }}>
            {searchQuery ? (
              <>
                <Typography
                  sx={{ color: '#8E8E93', fontWeight: 500 }}
                  gutterBottom
                >
                  {t('rooms.noRoomsFound', { query: searchQuery })}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#0A84FF',
                    fontWeight: 600,
                    cursor: 'pointer',
                    mt: 1,
                  }}
                  onClick={() => setSearchQuery('')}
                >
                  {t('rooms.clearSearch')}
                </Typography>
              </>
            ) : (
              <>
                <Typography
                  variant="h6"
                  sx={{ color: '#8E8E93', fontWeight: 600, fontSize: '1rem' }}
                  gutterBottom
                >
                  {t('rooms.noRoomsYet')}
                </Typography>
                <Typography variant="body2" sx={{ color: '#636366', fontSize: '0.85rem' }} paragraph>
                  {t('rooms.createFirstRoom')}
                </Typography>
                <Tooltip title={t('rooms.createRoom')}>
                  <IconButton
                    onClick={openModal}
                    size="large"
                    sx={{
                      mt: 2,
                      bgcolor: '#0A84FF',
                      color: '#FFFFFF',
                      width: 56,
                      height: 56,
                      borderRadius: 3,
                      '&:hover': {
                        bgcolor: '#0A84FF',
                        opacity: 0.85,
                      },
                      transition: 'opacity 0.15s ease',
                    }}
                  >
                    <AddIcon sx={{ fontSize: 28 }} />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
        ) : (
          <List disablePadding>
            {uniqueRooms.map((room) => (
              <ListItem key={room.id} disablePadding sx={{ mb: 0.25 }}>
                <ListItemButton
                  selected={activeRoomId === room.id}
                  onClick={() => setActiveRoom(room.id)}
                  sx={{
                    borderRadius: 2.5,
                    transition: 'background-color 0.15s ease',
                    '&.Mui-selected': {
                      bgcolor: 'rgba(10, 132, 255, 0.1)',
                      '&:hover': {
                        bgcolor: 'rgba(10, 132, 255, 0.15)',
                      },
                    },
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.05)',
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
    </Box>
  );
};
