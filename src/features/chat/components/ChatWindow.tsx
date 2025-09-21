/**
 * ChatWindow Component
 *
 * @module features/chat/components/ChatWindow
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Group as GroupIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { useRoomsStore } from '@/features/rooms/stores/roomsStore';
import { useAuth } from '@/features/auth';
import { useRoomActions } from '@/features/rooms';
import { useSendMessage } from '../hooks/useSendMessage';
import type { Message } from '../types';

interface ChatWindowProps {
  roomId: string;
  onBack?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ roomId, onBack }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { deleteRoom, leaveRoom } = useRoomActions();
  const { deleteMessage } = useSendMessage();
  const room = useRoomsStore((state) =>
    state.rooms.find((r) => r.id === roomId)
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [showSearch, setShowSearch] = useState(false);

  if (!room) {
    return null;
  }

  const isCreator = room.creatorId === user?.uid;
  const isMember = user ? room.members.includes(user.uid) : false;

  const handleDelete = (messageId: string) => {
    deleteMessage(roomId, messageId);
  };

  const handleLeave = () => {
    leaveRoom(roomId);
    onBack?.();
  };

  const handleDeleteRoom = () => {
    deleteRoom(roomId);
    onBack?.();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      <AppBar
        position="static"
        elevation={0}
        className="glass-panel"
        sx={{
          borderBottom: '0.5px solid rgba(255,255,255,0.1)',
          borderRadius: 0,
        }}
      >
        <Toolbar sx={{ gap: 1.5, py: 1 }}>
          <IconButton
            edge="start"
            onClick={onBack}
            sx={{
              display: { md: 'none' },
              color: '#8E8E93',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', color: '#FFFFFF' },
            }}
          >
            <BackIcon />
          </IconButton>

          <Avatar
            src={room.avatarUrl}
            sx={{
              background: room.avatarUrl
                ? 'transparent'
                : 'linear-gradient(135deg, #5E5CE6 0%, #0A84FF 100%)',
              color: '#FFFFFF',
              width: 42,
              height: 42,
            }}
          >
            <GroupIcon sx={{ fontSize: 22 }} />
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              fontWeight="600"
              noWrap
              sx={{ color: '#FFFFFF', letterSpacing: '-0.01em', fontSize: '0.95rem' }}
            >
              {room.name}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: '#8E8E93', fontWeight: 500, fontSize: '0.75rem' }}
            >
              {t('rooms.activeMembers', { count: room.memberCount })}
            </Typography>
          </Box>

          {!isCreator && isMember && (
            <Tooltip title={t('rooms.leaveRoom')}>
              <IconButton
                onClick={handleLeave}
                sx={{
                  color: '#8E8E93',
                  '&:hover': {
                    bgcolor: 'rgba(255, 69, 58, 0.1)',
                    color: '#FF453A',
                  },
                }}
              >
                <BackIcon />
              </IconButton>
            </Tooltip>
          )}

          {isCreator && (
            <Tooltip title={t('rooms.deleteRoom')}>
              <IconButton
                onClick={handleDeleteRoom}
                sx={{
                  color: '#8E8E93',
                  '&:hover': {
                    bgcolor: 'rgba(255, 69, 58, 0.1)',
                    color: '#FF453A',
                  },
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title={showSearch ? t('chat.closeSearch') : t('chat.searchMessages')}>
            <IconButton
              onClick={() => setShowSearch(!showSearch)}
              sx={{
                color: showSearch ? '#0A84FF' : '#8E8E93',
                bgcolor: showSearch ? 'rgba(10, 132, 255, 0.1)' : 'transparent',
                '&:hover': {
                  bgcolor: showSearch ? 'rgba(10, 132, 255, 0.15)' : 'rgba(255,255,255,0.08)',
                  color: '#0A84FF',
                },
                transition: 'background-color 0.15s ease',
              }}
            >
              {showSearch ? <CloseIcon /> : <SearchIcon />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {showSearch && (
        <Box
          sx={{
            p: 2,
            bgcolor: 'rgba(28, 28, 30, 0.6)',
            backdropFilter: 'blur(20px)',
            borderBottom: '0.5px solid rgba(255,255,255,0.1)',
            animation: 'slideUpFade 0.15s cubic-bezier(0.25, 0.1, 0.25, 1) forwards',
          }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder={t('chat.searchInMessages')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: '#0A84FF' }} />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchQuery('')}
                    sx={{ color: '#8E8E93' }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2.5,
                bgcolor: 'rgba(118, 118, 128, 0.12)',
                border: 'none',
                '& fieldset': { border: 'none' },
                '&:hover': {
                  bgcolor: 'rgba(118, 118, 128, 0.18)',
                },
                '&.Mui-focused': {
                  bgcolor: 'rgba(118, 118, 128, 0.24)',
                },
                '& .MuiInputBase-input': {
                  color: '#FFFFFF',
                  '&::placeholder': { color: '#636366', opacity: 1 },
                },
              },
            }}
          />
        </Box>
      )}

      <Box sx={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <MessageList
          roomId={roomId}
          searchQuery={searchQuery}
          onReply={setReplyingTo}
          onDelete={handleDelete}
        />
      </Box>

      <ChatInput
        roomId={roomId}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
      />
    </Box>
  );
};
