import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './useDebounce';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('should debounce the value update after the specified delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'first', delay: 500 } }
    );

    expect(result.current).toBe('first');

    rerender({ value: 'second', delay: 500 });

    expect(result.current).toBe('first');

    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(result.current).toBe('first');

    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(result.current).toBe('second');
  });

  it('should reset the timer if value changes before delay completes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'first', delay: 500 } }
    );

    rerender({ value: 'second', delay: 500 });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('first');

    rerender({ value: 'third', delay: 500 });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('first');

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe('third');
  });

  it('should handle different data types correctly', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }: { value: unknown; delay: number }) => useDebounce(value, delay),
      { initialProps: { value: 42 as unknown, delay: 100 } }
    );

    expect(result.current).toBe(42);

    rerender({ value: { id: 1, name: 'test' } as unknown, delay: 100 });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current).toEqual({ id: 1, name: 'test' });
  });

  it('should cleanup timer on unmount to prevent memory leaks', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
    const { unmount } = renderHook(() => useDebounce('test', 500));

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });
});
