/**
 * RoomItem Component
 *
 * @module features/rooms/components/RoomItem
 */

import {
  Avatar,
  Box,
  Typography,
  Badge,
} from '@mui/material';
import { Group as GroupIcon } from '@mui/icons-material';
import type { Room } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { faIR } from 'date-fns/locale';

interface RoomItemProps {
  room: Room;
}

export const RoomItem: React.FC<RoomItemProps> = ({ room }) => {
  const lastActivityTime = formatDistanceToNow(new Date(room.lastActivityAt), {
    addSuffix: true,
    locale: faIR,
  });

  return (
    <Box 
      className="glass-panel-hover"
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        width: '100%', 
        gap: 2,
        p: 2,
        borderRadius: 3,
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      <Badge
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        variant="dot"
        sx={{
          '& .MuiBadge-badge': {
            bgcolor: '#00F0FF',
            boxShadow: '0 0 8px #00F0FF',
            border: '2px solid #0B0F19',
          }
        }}
        invisible={!room.isActive}
      >
        <Avatar
          src={room.avatarUrl}
          alt={room.name}
          sx={{
            width: 52,
            height: 52,
            background: room.avatarUrl ? 'transparent' : 'linear-gradient(135deg, #7000FF 0%, #00F0FF 100%)',
            color: '#0B0F19',
            fontWeight: 700,
            fontSize: '1.2rem',
            border: '2px solid rgba(255,255,255,0.1)',
            boxShadow: '0 4px 12px rgba(112, 0, 255, 0.2)',
          }}
        >
          {room.avatarUrl ? null : <GroupIcon sx={{ fontSize: 28 }} />}
        </Avatar>
      </Badge>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.5 }}>
          <Typography
            variant="subtitle1"
            fontWeight="700"
            noWrap
            sx={{ 
              maxWidth: '65%',
              color: '#F8FAFC',
              letterSpacing: '-0.01em',
            }}
          >
            {room.name}
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: '#64748B',
              fontWeight: 500,
              fontSize: '0.75rem',
            }} 
            noWrap
          >
            {lastActivityTime}
          </Typography>
        </Box>

        <Typography
          variant="body2"
          noWrap
          sx={{ 
            maxWidth: '100%',
            color: '#94A3B8',
            fontSize: '0.85rem',
            lineHeight: 1.5,
          }}
        >
          {room.lastMessage ? (
            <>
              <Typography component="span" sx={{ color: '#00F0FF', fontWeight: 600 }}>
                {room.lastMessage.senderName}:
              </Typography>{' '}
              {room.lastMessage.content}
            </>
          ) : (
            <span style={{ color: '#64748B' }}>{room.description || 'بدون توضیحات'}</span>
          )}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <Box 
            sx={{ 
              width: 6, 
              height: 6, 
              borderRadius: '50%', 
              bgcolor: '#7000FF',
              mr: 1,
              boxShadow: '0 0 6px #7000FF'
            }} 
          />
          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500, fontSize: '0.75rem' }}>
            {room.memberCount} عضو
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};