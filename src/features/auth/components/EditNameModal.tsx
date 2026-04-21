/**
 * EditNameModal Component
 *
 * مودال ویرایش نام نمایشی کاربر
 *
 * @module features/auth/components/EditNameModal
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

interface EditNameModalProps {
  open: boolean;
  onClose: () => void;
}

export const EditNameModal: React.FC<EditNameModalProps> = ({ open, onClose }) => {
  const { t, i18n } = useTranslation();
  const { user, updateDisplayName } = useAuth();
  const [newName, setNewName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (open && user) {
      setNewName(user.displayName);
    }
  }, [open, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = newName.trim();
    if (!trimmedName || trimmedName.length < 2) {
      toast.error(t('auth.nameTooShort'));
      return;
    }

    if (trimmedName === user?.displayName) {
      onClose();
      return;
    }

    setIsUpdating(true);
    try {
      await updateDisplayName(trimmedName);
      toast.success(t('auth.nameUpdated'));
      onClose();
    } catch {
      toast.error(t('auth.nameUpdateFailed'));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    if (!isUpdating) {
      setNewName('');
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      dir={i18n.dir()}
      PaperProps={{
        sx: {
          borderRadius: 4,
          bgcolor: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
        }}
      >
        <Typography
          component="span"
          variant="h6"
          fontWeight="700"
          sx={{ color: '#F8FAFC', letterSpacing: '-0.01em' }}
        >
          {t('auth.editName')}
        </Typography>
        <IconButton
          onClick={handleClose}
          size="small"
          disabled={isUpdating}
          sx={{
            color: '#94A3B8',
            '&:hover': {
              bgcolor: 'rgba(255, 107, 107, 0.1)',
              color: '#FF6B6B',
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            autoFocus
            fullWidth
            label={t('auth.displayName')}
            placeholder={t('auth.enterNewName')}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            disabled={isUpdating}
            inputProps={{ maxLength: 50 }}
            sx={{
              '& .MuiFormLabel-root': { color: '#94A3B8' },
              '& .MuiInputBase-input': {
                color: '#F8FAFC',
                '&::placeholder': { color: '#64748B', opacity: 1 },
              },
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                bgcolor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
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
              },
            }}
          />
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1, gap: 1.5 }}>
          <Button
            onClick={handleClose}
            disabled={isUpdating}
            sx={{
              color: '#94A3B8',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
            }}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isUpdating || !newName.trim()}
            sx={{
              minWidth: 140,
              background: isUpdating
                ? 'rgba(255,255,255,0.1)'
                : 'linear-gradient(135deg, #00F0FF 0%, #7000FF 100%)',
              color: isUpdating ? '#94A3B8' : '#0B0F19',
              fontWeight: 700,
              '&:hover': {
                background: isUpdating
                  ? 'rgba(255,255,255,0.1)'
                  : 'linear-gradient(135deg, #66F9FF 0%, #9D4DFF 100%)',
              },
            }}
          >
            {isUpdating ? t('common.loading') : t('auth.updateName')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
