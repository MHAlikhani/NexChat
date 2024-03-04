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
    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
      <Badge
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        variant="dot"
        color="success"
        invisible={!room.isActive}
      >
        <Avatar
          src={room.avatarUrl}
          alt={room.name}
          sx={{
            width: 48,
            height: 48,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
          }}
        >
          {room.avatarUrl ? null : <GroupIcon />}
        </Avatar>
      </Badge>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            noWrap
            sx={{ maxWidth: '70%' }}
          >
            {room.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {lastActivityTime}
          </Typography>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          noWrap
          sx={{ maxWidth: '100%' }}
        >
          {room.lastMessage ? (
            <>
              <strong>{room.lastMessage.senderName}:</strong>{' '}
              {room.lastMessage.content}
            </>
          ) : (
            room.description || 'بدون توضیحات'
          )}
        </Typography>

        <Typography variant="caption" color="text.secondary">
          {room.memberCount} عضو
        </Typography>
      </Box>
    </Box>
  );
};
