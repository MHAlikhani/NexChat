/**
 * RoomItem Component
 *
 * @module features/rooms/components/RoomItem
 */

import { Avatar, Box, Typography, Badge } from '@mui/material';
import { Group as GroupIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { Room } from '../types';
import { formatDistanceToNow } from 'date-fns';
import type { Locale } from 'date-fns';
import { faIR } from 'date-fns/locale';
import { enUS, de } from 'date-fns/locale';

interface RoomItemProps {
  room: Room;
}

const localeMap: Record<string, Locale> = {
  fa: faIR,
  en: enUS,
  de: de,
};

export const RoomItem: React.FC<RoomItemProps> = ({ room }) => {
  const { i18n, t } = useTranslation();

  const lastActivityTime = formatDistanceToNow(new Date(room.lastActivityAt), {
    addSuffix: true,
    locale: localeMap[i18n.language] || enUS,
  });

  return (
    <Box
      className="glass-panel-hover"
      sx={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        gap: 2,
        p: 1.5,
        borderRadius: 2.5,
        cursor: 'pointer',
      }}
    >
      <Badge
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        variant="dot"
        sx={{
          '& .MuiBadge-badge': {
            bgcolor: '#30D158',
            border: '2px solid #000000',
            width: 10,
            height: 10,
          },
        }}
        invisible={!room.isActive}
      >
        <Avatar
          src={room.avatarUrl}
          alt={room.name}
          sx={{
            width: 48,
            height: 48,
            background: room.avatarUrl
              ? 'transparent'
              : 'linear-gradient(135deg, #5E5CE6 0%, #0A84FF 100%)',
            color: '#FFFFFF',
            fontWeight: 600,
            fontSize: '1.1rem',
          }}
        >
          {room.avatarUrl ? null : <GroupIcon sx={{ fontSize: 24 }} />}
        </Avatar>
      </Badge>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            mb: 0.25,
          }}
        >
          <Typography
            variant="subtitle1"
            fontWeight="600"
            noWrap
            sx={{
              maxWidth: '70%',
              color: '#FFFFFF',
              letterSpacing: '-0.01em',
              fontSize: '0.95rem',
            }}
          >
            {room.name}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: '#636366',
              fontWeight: 500,
              fontSize: '0.7rem',
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
            color: '#8E8E93',
            fontSize: '0.8rem',
            lineHeight: 1.4,
          }}
        >
          {room.lastMessage ? (
            <>
              <Typography
                component="span"
                sx={{ color: '#0A84FF', fontWeight: 600, fontSize: '0.8rem' }}
              >
                {room.lastMessage.senderName}:
              </Typography>{' '}
              {room.lastMessage.content}
            </>
          ) : (
            <span style={{ color: '#636366' }}>
              {room.description || t('rooms.noDescription')}
            </span>
          )}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
          <Box
            sx={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              bgcolor: '#5E5CE6',
              mr: 0.75,
            }}
          />
          <Typography
            variant="caption"
            sx={{ color: '#636366', fontWeight: 500, fontSize: '0.7rem' }}
          >
            {t('rooms.members', { count: room.memberCount })}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
