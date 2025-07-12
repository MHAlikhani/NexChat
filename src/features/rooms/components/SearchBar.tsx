/**
 * SearchBar Component
 *
 * کامپوننت جستجوی ساده و بدون state داخلی
 * Debounce در hook level انجام می‌شود
 *
 * @module features/rooms/components/SearchBar
 */

import { TextField, InputAdornment, IconButton } from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder,
}) => {
  const { t } = useTranslation();

  return (
    <TextField
      fullWidth
      size="small"
      placeholder={placeholder || t('rooms.searchRooms')}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon sx={{ color: '#00F0FF', fontSize: 20 }} />
          </InputAdornment>
        ),
        endAdornment: value && (
          <InputAdornment position="end">
            <IconButton
              size="small"
              onClick={() => onChange('')}
              sx={{
                color: '#94A3B8',
                '&:hover': {
                  color: '#FF6B6B',
                  bgcolor: 'rgba(255, 107, 107, 0.1)',
                },
              }}
            >
              <ClearIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </InputAdornment>
        ),
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          bgcolor: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 3,
          transition: 'all 0.3s ease',
          '& fieldset': { border: 'none' },
          '&:hover': {
            bgcolor: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(0, 240, 255, 0.3)',
          },
          '&.Mui-focused': {
            bgcolor: 'rgba(255,255,255,0.08)',
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
  );
};
