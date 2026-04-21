import { describe, it, expect, vi } from 'vitest';
import { formatMessageTime, formatRelativeTime } from './format';

vi.mock('date-fns', async () => {
  const actual = await vi.importActual('date-fns');
  return {
    ...actual,
  };
});

describe('formatMessageTime', () => {
  it('should format today time correctly', () => {
    const today = new Date().toISOString();
    const result = formatMessageTime(today, 'en');
    expect(result).toMatch(/^\d{2}:\d{2}$/);
  });

  it('should format yesterday time correctly', () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const result = formatMessageTime(yesterday, 'en');
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should format older date correctly', () => {
    const oldDate = new Date('2020-01-15T10:30:00Z').toISOString();
    const result = formatMessageTime(oldDate, 'en');
    expect(result).toContain('2020');
  });

  it('should use English locale by default', () => {
    const date = new Date('2020-01-15T10:30:00Z').toISOString();
    const result = formatMessageTime(date);
    expect(result).toContain('2020');
  });
});

describe('formatRelativeTime', () => {
  it('should format recent time correctly', () => {
    const recent = new Date().toISOString();
    const result = formatRelativeTime(recent, 'en');
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should use English locale by default', () => {
    const date = new Date(Date.now() - 3600000).toISOString();
    const result = formatRelativeTime(date);
    expect(result).toBeTruthy();
  });
});
