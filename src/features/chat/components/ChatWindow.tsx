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
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 0,
        }}
      >
        <Toolbar sx={{ gap: 2, py: 1 }}>
          <IconButton
            edge="start"
            onClick={onBack}
            sx={{
              display: { md: 'none' },
              color: '#94A3B8',
              '&:hover': { bgcolor: 'rgba(0, 240, 255, 0.1)', color: '#00F0FF' },
            }}
          >
            <BackIcon />
          </IconButton>

          <Avatar
            src={room.avatarUrl}
            sx={{
              background: room.avatarUrl
                ? 'transparent'
                : 'linear-gradient(135deg, #7000FF 0%, #00F0FF 100%)',
              color: '#0B0F19',
              width: 48,
              height: 48,
              boxShadow: '0 4px 15px rgba(112, 0, 255, 0.3)',
              border: '2px solid rgba(255,255,255,0.1)',
            }}
          >
            <GroupIcon sx={{ fontSize: 28 }} />
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              fontWeight="700"
              noWrap
              sx={{ color: '#F8FAFC', letterSpacing: '-0.01em' }}
            >
              {room.name}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: '#00F0FF', fontWeight: 600, fontSize: '0.8rem' }}
            >
              {t('rooms.activeMembers', { count: room.memberCount })}
            </Typography>
          </Box>

          {!isCreator && isMember && (
            <Tooltip title={t('rooms.leaveRoom')}>
              <IconButton
                onClick={handleLeave}
                sx={{
                  color: '#94A3B8',
                  '&:hover': {
                    bgcolor: 'rgba(255, 107, 107, 0.1)',
                    color: '#FF6B6B',
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
                  color: '#94A3B8',
                  '&:hover': {
                    bgcolor: 'rgba(255, 107, 107, 0.1)',
                    color: '#FF6B6B',
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
                color: showSearch ? '#00F0FF' : '#94A3B8',
                bgcolor: showSearch ? 'rgba(0, 240, 255, 0.1)' : 'transparent',
                border: showSearch
                  ? '1px solid rgba(0, 240, 255, 0.2)'
                  : '1px solid transparent',
                '&:hover': {
                  bgcolor: 'rgba(0, 240, 255, 0.15)',
                  color: '#00F0FF',
                  borderColor: 'rgba(0, 240, 255, 0.3)',
                },
                transition: 'all 0.3s ease',
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
            bgcolor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            animation:
              'slideUpFade 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
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
                  <SearchIcon fontSize="small" sx={{ color: '#00F0FF' }} />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchQuery('')}
                    sx={{ color: '#94A3B8' }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                bgcolor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                '& fieldset': { border: 'none' },
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(0, 240, 255, 0.3)',
                },
                '&.Mui-focused': {
                  bgcolor: 'rgba(255,255,255,0.1)',
                  border: '1px solid #00F0FF',
                  boxShadow: '0 0 0 4px rgba(0, 240, 255, 0.1)',
                },
                '& .MuiInputBase-input': {
                  color: '#F8FAFC',
                  '&::placeholder': { color: '#64748B', opacity: 1 },
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
