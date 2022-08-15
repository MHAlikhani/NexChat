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
import type { RoomType } from '../types';

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
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        ایجاد اتاق جدید
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
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
                />
              )}
            />

            {/* Room Type */}
            <FormControl>
              <FormLabel>نوع اتاق</FormLabel>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <RadioGroup {...field} row>
                    <FormControlLabel
                      value="public"
                      control={<Radio />}
                      label={
                        <Box>
                          <Typography variant="body1">عمومی</Typography>
                          <Typography variant="caption" color="text.secondary">
                            همه می‌توانند ببینند و عضو شوند
                          </Typography>
                        </Box>
                      }
                    />
                    <FormControlLabel
                      value="private"
                      control={<Radio />}
                      label={
                        <Box>
                          <Typography variant="body1">خصوصی</Typography>
                          <Typography variant="caption" color="text.secondary">
                            فقط با دعوت‌نامه
                          </Typography>
                        </Box>
                      }
                    />
                  </RadioGroup>
                )}
              />
            </FormControl>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={handleClose} disabled={isCreating}>
            انصراف
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isCreating}
            sx={{ minWidth: 120 }}
          >
            {isCreating ? 'در حال ایجاد...' : 'ایجاد اتاق'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};