/**
 * DateSeparator Component
 *
 * جداکننده تاریخ بین پیام‌ها
 *
 * @module features/chat/components/DateSeparator
 */

import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface DateSeparatorProps {
  date: string;
}

export const DateSeparator: React.FC<DateSeparatorProps> = ({ date }) => {
  const { t, i18n } = useTranslation();

  const locale = i18n.language === 'fa' ? 'fa-IR' : i18n.language;
  const today = new Date().toLocaleDateString(locale);
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleDateString(locale);

  let displayDate = date;
  if (date === today) {
    displayDate = t('chat.today');
  } else if (date === yesterday) {
    displayDate = t('chat.yesterday');
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
      <Typography
        variant="caption"
        sx={{
          bgcolor: 'rgba(28, 28, 30, 0.8)',
          px: 1.5,
          py: 0.5,
          borderRadius: 2,
          color: '#8E8E93',
          fontSize: 12,
          fontWeight: 500,
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          border: '0.5px solid rgba(255,255,255,0.1)',
        }}
      >
        {displayDate}
      </Typography>
    </Box>
  );
};
