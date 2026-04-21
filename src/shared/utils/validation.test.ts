import { describe, it, expect, vi } from 'vitest';
import { messageSchema, roomSchema } from './validation';
import { UI } from '../constants';

vi.mock('@/lib/i18n', () => ({
  default: {
    t: (key: string) => key,
  },
}));

describe('messageSchema', () => {
  it('should validate a valid message', () => {
    const result = messageSchema.safeParse({ content: 'Hello World' });
    expect(result.success).toBe(true);
  });

  it('should reject an empty message', () => {
    const result = messageSchema.safeParse({ content: '   ' });
    expect(result.success).toBe(false);
  });

  it('should reject a message that is too long', () => {
    const longMessage = 'a'.repeat(UI.MAX_MESSAGE_LENGTH + 1);
    const result = messageSchema.safeParse({ content: longMessage });
    expect(result.success).toBe(false);
  });

  it('should accept a message at max length', () => {
    const maxMessage = 'a'.repeat(UI.MAX_MESSAGE_LENGTH);
    const result = messageSchema.safeParse({ content: maxMessage });
    expect(result.success).toBe(true);
  });
});

describe('roomSchema', () => {
  it('should validate a valid room', () => {
    const result = roomSchema.safeParse({
      name: 'General Chat',
      description: 'A general chat room',
    });
    expect(result.success).toBe(true);
  });

  it('should reject a room name that is too short', () => {
    const result = roomSchema.safeParse({ name: 'Ab' });
    expect(result.success).toBe(false);
  });

  it('should allow room without description', () => {
    const result = roomSchema.safeParse({ name: 'General Chat' });
    expect(result.success).toBe(true);
  });

  it('should reject a room name that is too long', () => {
    const result = roomSchema.safeParse({ name: 'a'.repeat(51) });
    expect(result.success).toBe(false);
  });
});
