/**
 * CreateRoomModal Component
 *
 * مودال ایجاد اتاق جدید
 *
 * @module features/rooms/components/CreateRoomModal
 */

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useCreateRoom } from '../hooks/useCreateRoom';
import { createRoomSchema, type CreateRoomFormData } from '../utils/validators';

export const CreateRoomModal: React.FC = () => {
  const { isModalOpen, closeModal, createRoom, isCreating } = useCreateRoom();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateRoomFormData>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'public',
    },
  });

  const onSubmit = async (data: CreateRoomFormData) => {
    await createRoom(data);
    reset();
  };

  const handleClose = () => {
    reset();
    closeModal();
  };

  return (
    <Dialog
      open={isModalOpen}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      dir="rtl"
      PaperProps={{
        sx: {
          borderRadius: 4,
          bgcolor: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h6" fontWeight="700" sx={{ color: '#F8FAFC', letterSpacing: '-0.01em' }}>
          ایجاد اتاق جدید
        </Typography>
        <IconButton 
          onClick={handleClose} 
          size="small"
          sx={{
            color: '#94A3B8',
            '&:hover': { bgcolor: 'rgba(255, 107, 107, 0.1)', color: '#FF6B6B' }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Room Name */}
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="نام اتاق"
                  placeholder="مثال: تیم توسعه"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  fullWidth
                  required
                  sx={{
                    '& .MuiFormLabel-root': { color: '#94A3B8' },
                    '& .MuiFormHelperText-root': { color: '#FF6B6B' },
                  }}
                />
              )}
            />

            {/* Description */}
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="توضیحات"
                  placeholder="توضیحات اختیاری درباره اتاق"
                  error={!!errors.description}
                  helperText={errors.description?.message}
                  multiline
                  rows={3}
                  fullWidth
                  sx={{
                    '& .MuiFormLabel-root': { color: '#94A3B8' },
                    '& .MuiFormHelperText-root': { color: '#FF6B6B' },
                  }}
                />
              )}
            />

            {/* Room Type */}
            <FormControl>
              <FormLabel sx={{ color: '#F8FAFC', fontWeight: 600, mb: 1 }}>نوع اتاق</FormLabel>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <RadioGroup {...field} row sx={{ gap: 2 }}>
                    <FormControlLabel
                      value="public"
                      control={
                        <Radio 
                          sx={{ 
                            color: '#94A3B8',
                            '&.Mui-checked': { color: '#00F0FF' },
                          }} 
                        />
                      }
                      label={
                        <Box sx={{ mr: 1 }}>
                          <Typography variant="body1" sx={{ color: '#F8FAFC', fontWeight: 600 }}>عمومی</Typography>
                          <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.5 }}>
                            همه می‌توانند ببینند و عضو شوند
                          </Typography>
                        </Box>
                      }
                      sx={{
                        flex: 1,
                        borderRadius: 2,
                        border: '1px solid rgba(255,255,255,0.08)',
                        bgcolor: 'rgba(255,255,255,0.03)',
                        p: 1.5,
                        m: 0,
                        transition: 'all 0.2s ease',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' },
                        '&.Mui-checked': {
                          border: '1px solid rgba(0, 240, 255, 0.3)',
                          bgcolor: 'rgba(0, 240, 255, 0.05)',
                        }
                      }}
                    />
                    <FormControlLabel
                      value="private"
                      control={
                        <Radio 
                          sx={{ 
                            color: '#94A3B8',
                            '&.Mui-checked': { color: '#7000FF' },
                          }} 
                        />
                      }
                      label={
                        <Box sx={{ mr: 1 }}>
                          <Typography variant="body1" sx={{ color: '#F8FAFC', fontWeight: 600 }}>خصوصی</Typography>
                          <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.5 }}>
                            فقط با دعوت‌نامه
                          </Typography>
                        </Box>
                      }
                      sx={{
                        flex: 1,
                        borderRadius: 2,
                        border: '1px solid rgba(255,255,255,0.08)',
                        bgcolor: 'rgba(255,255,255,0.03)',
                        p: 1.5,
                        m: 0,
                        transition: 'all 0.2s ease',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' },
                        '&.Mui-checked': {
                          border: '1px solid rgba(112, 0, 255, 0.3)',
                          bgcolor: 'rgba(112, 0, 255, 0.05)',
                        }
                      }}
                    />
                  </RadioGroup>
                )}
              />
            </FormControl>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1, gap: 1.5 }}>
          <Button 
            onClick={handleClose} 
            disabled={isCreating}
            sx={{
              color: '#94A3B8',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }
            }}
          >
            انصراف
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isCreating}
            sx={{ 
              minWidth: 140,
              background: isCreating ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #00F0FF 0%, #7000FF 100%)',
              color: isCreating ? '#94A3B8' : '#0B0F19',
              fontWeight: 700,
              '&:hover': {
                background: isCreating ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #66F9FF 0%, #9D4DFF 100%)',
              }
            }}
          >
            {isCreating ? 'در حال ایجاد...' : 'ایجاد اتاق'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};