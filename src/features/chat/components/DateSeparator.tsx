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
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleDateString(
    locale
  );

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
          bgcolor: 'rgba(225, 225, 225, 0.9)',
          px: 1.5,
          py: 0.5,
          borderRadius: 2,
          color: 'text.secondary',
          fontSize: 12,
          boxShadow: '0 1px 1px rgba(0,0,0,0.05)',
        }}
      >
        {displayDate}
      </Typography>
    </Box>
  );
};
