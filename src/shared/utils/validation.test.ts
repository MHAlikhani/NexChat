import { describe, it, expect } from 'vitest';
import { messageSchema, roomSchema } from './validation';
import { UI } from '../constants';

describe('messageSchema', () => {
  it('should validate a valid message', () => {
    const result = messageSchema.safeParse({ content: 'Hello World' });
    expect(result.success).toBe(true);
  });

  it('should reject an empty message', () => {
    const result = messageSchema.safeParse({ content: '   ' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('پیام نمی‌تواند خالی باشد');
    }
  });

  it('should reject a message that is too long', () => {
    const longMessage = 'a'.repeat(UI.MAX_MESSAGE_LENGTH + 1);
    const result = messageSchema.safeParse({ content: longMessage });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('حداکثر طول پیام');
    }
  });
});

describe('roomSchema', () => {
  it('should validate a valid room', () => {
    const result = roomSchema.safeParse({ name: 'General Chat', description: 'A general chat room' });
    expect(result.success).toBe(true);
  });

  it('should reject a room name that is too short', () => {
    const result = roomSchema.safeParse({ name: 'Ab' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('نام اتاق باید حداقل ۳ کاراکتر باشد');
    }
  });

  it('should allow room without description', () => {
    const result = roomSchema.safeParse({ name: 'General Chat' });
    expect(result.success).toBe(true);
  });
});