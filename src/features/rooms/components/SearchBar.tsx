/**
 * SearchBar Component
 *
 * کامپوننت جستجوی ساده و بدون state داخلی
 * Debounce در hook level انجام می‌شود
 *
 * @module features/rooms/components/SearchBar
 */

import { TextField, InputAdornment } from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'جستجوی اتاق‌ها...',
}) => {
  return (
    <TextField
      fullWidth
      size="small"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon color="action" />
          </InputAdornment>
        ),
        endAdornment: value && (
          <InputAdornment position="end">
            <ClearIcon
              sx={{ cursor: 'pointer' }}
              onClick={() => onChange('')}
            />
          </InputAdornment>
        ),
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          bgcolor: 'background.paper',
          borderRadius: 2,
        },
      }}
    />
  );
};