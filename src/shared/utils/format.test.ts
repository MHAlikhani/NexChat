import { describe, it, expect } from 'vitest';
import { formatFileSize, formatDuration } from './format';

describe('formatFileSize', () => {
  it('should return "0 Bytes" for 0 bytes', () => {
    expect(formatFileSize(0)).toBe('0 Bytes');
  });

  it('should format bytes correctly', () => {
    expect(formatFileSize(500)).toBe('500 Bytes');
  });

  it('should format kilobytes correctly', () => {
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(1536)).toBe('1.5 KB');
  });

  it('should format megabytes correctly', () => {
    expect(formatFileSize(1048576)).toBe('1 MB');
    expect(formatFileSize(1572864)).toBe('1.5 MB');
  });

  it('should format gigabytes correctly', () => {
    expect(formatFileSize(1073741824)).toBe('1 GB');
  });
});

describe('formatDuration', () => {
  it('should format seconds correctly', () => {
    expect(formatDuration(0)).toBe('0:00');
    expect(formatDuration(5)).toBe('0:05');
    expect(formatDuration(45)).toBe('0:45');
  });

  it('should format minutes and seconds correctly', () => {
    expect(formatDuration(60)).toBe('1:00');
    expect(formatDuration(65)).toBe('1:05');
    expect(formatDuration(125)).toBe('2:05');
  });

  it('should handle large durations', () => {
    expect(formatDuration(3661)).toBe('61:01');
  });
});