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
            height={72}
            sx={{ mb: 1, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.03)' }}
          />
        ))}
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="#FF6B6B" gutterBottom fontWeight="600">
          {t('rooms.loadError')}
        </Typography>
        <Typography variant="body2" color="#94A3B8" paragraph>
          {error.message}
        </Typography>
        <Tooltip title={t('common.retry')}>
          <IconButton onClick={refresh} sx={{ color: '#00F0FF' }}>
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
        borderRight: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <Box
        sx={{
          p: 2.5,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                p: 1,
                borderRadius: 2,
                bgcolor: 'rgba(0, 240, 255, 0.1)',
                color: '#00F0FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ChatIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                fontWeight="800"
                sx={{ color: '#F8FAFC', letterSpacing: '-0.02em' }}
              >
                {t('rooms.title')}
              </Typography>
              {uniqueRooms.length > 0 && (
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500 }}>
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
                  bgcolor: 'rgba(112, 0, 255, 0.15)',
                  color: '#9D4DFF',
                  border: '1px solid rgba(112, 0, 255, 0.2)',
                  '&:hover': {
                    bgcolor: 'rgba(112, 0, 255, 0.25)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
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
                  color: '#94A3B8',
                  opacity: isLoading ? 0.5 : 1,
                  '&:hover': {
                    color: '#00F0FF',
                    bgcolor: 'rgba(0, 240, 255, 0.1)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto', p: 1.5 }}>
        {uniqueRooms.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center', mt: 4 }}>
            {searchQuery ? (
              <>
                <Typography
                  sx={{ color: '#94A3B8', fontWeight: 500 }}
                  gutterBottom
                >
                  {t('rooms.noRoomsFound', { query: searchQuery })}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#00F0FF',
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
                  sx={{ color: '#94A3B8', fontWeight: 600 }}
                  gutterBottom
                >
                  {t('rooms.noRoomsYet')}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748B' }} paragraph>
                  {t('rooms.createFirstRoom')}
                </Typography>
                <Tooltip title={t('rooms.createRoom')}>
                  <IconButton
                    onClick={openModal}
                    size="large"
                    sx={{
                      mt: 2,
                      background:
                        'linear-gradient(135deg, #7000FF 0%, #00F0FF 100%)',
                      color: '#0B0F19',
                      width: 64,
                      height: 64,
                      boxShadow: '0 8px 24px rgba(112, 0, 255, 0.3)',
                      '&:hover': {
                        background:
                          'linear-gradient(135deg, #9D4DFF 0%, #66F9FF 100%)',
                        transform: 'translateY(-4px) scale(1.05)',
                        boxShadow: '0 12px 32px rgba(112, 0, 255, 0.4)',
                      },
                      transition:
                        'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
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
              <ListItem key={room.id} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={activeRoomId === room.id}
                  onClick={() => setActiveRoom(room.id)}
                  sx={{
                    borderRadius: 3,
                    transition:
                      'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    '&.Mui-selected': {
                      bgcolor: 'rgba(0, 240, 255, 0.08)',
                      border: '1px solid rgba(0, 240, 255, 0.2)',
                      boxShadow: '0 4px 12px rgba(0, 240, 255, 0.1)',
                      '&:hover': {
                        bgcolor: 'rgba(0, 240, 255, 0.12)',
                      },
                    },
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.05)',
                      transform: 'translateX(-4px)',
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
