/**
 * ChatWindow Component
 *
 * پنجره اصلی چت شامل لیست پیام‌ها و ورودی
 *
 * @module features/chat/components/ChatWindow
 */

import { Box, AppBar, Toolbar, Typography, Avatar, IconButton, Tooltip } from '@mui/material';
import { ArrowBack as BackIcon, Group as GroupIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { useRoomsStore } from '@/features/rooms/stores/roomsStore';
import { useAuth } from '@/features/auth';
import { useRoomActions } from '@/features/rooms';

interface ChatWindowProps {
  roomId: string;
  onBack?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ roomId, onBack }) => {
  const { user } = useAuth();
  const { deleteRoom, leaveRoom } = useRoomActions();
  const room = useRoomsStore((state) =>
    state.rooms.find((r) => r.id === roomId)
  );

  if (!room) {
    return null;
  }

  const isCreator = room.creatorId === user?.uid;
  const isMember = user ? room.members.includes(user.uid) : false;

  const handleDelete = () => {
    deleteRoom(roomId);
    onBack?.();
  };

  const handleLeave = () => {
    leaveRoom(roomId);
    onBack?.();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar sx={{ gap: 1 }}>
          <IconButton
            edge="start"
            onClick={onBack}
            sx={{ display: { md: 'none' } }}
          >
            <BackIcon />
          </IconButton>

          <Avatar src={room.avatarUrl} sx={{ bgcolor: 'primary.main' }}>
            <GroupIcon />
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight="bold" noWrap>
              {room.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {room.memberCount} عضو
            </Typography>
          </Box>

          {!isCreator && isMember && (
            <Tooltip title="خروج از اتاق">
              <IconButton onClick={handleLeave}>
                <BackIcon />
              </IconButton>
            </Tooltip>
          )}

          {isCreator && (
            <Tooltip title="حذف اتاق">
              <IconButton onClick={handleDelete} color="error">
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}
        </Toolbar>
      </AppBar>

      {/* Messages */}
      <MessageList roomId={roomId} />

      {/* Input */}
      <ChatInput roomId={roomId} />
    </Box>
  );
};