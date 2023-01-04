/**
 * TypingIndicator Component
 *
 * نمایش کاربران در حال تایپ
 *
 * @module features/chat/components/TypingIndicator
 */

import { Box, Typography, Avatar, AvatarGroup } from '@mui/material';

interface TypingIndicatorProps {
  users: Record<string, string>;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ users }) => {
  const userList = Object.values(users);

  if (userList.length === 0) return null;

  const text =
    userList.length === 1
      ? `${userList[0]} در حال تایپ است...`
      : `${userList.length} نفر در حال تایپ هستند...`;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.5 }}>
      <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: 12 } }}>
        {userList.map((name, index) => (
          <Avatar key={index} sx={{ bgcolor: 'primary.main' }}>
            {name.charAt(0)}
          </Avatar>
        ))}
      </AvatarGroup>

      <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
        {text}
      </Typography>
    </Box>
  );
};