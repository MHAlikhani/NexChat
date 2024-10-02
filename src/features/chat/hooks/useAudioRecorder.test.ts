import { renderHook, act } from '@testing-library/react';
import { useAudioRecorder, MAX_RECORD_DURATION } from './useAudioRecorder';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

vi.mock('react-hot-toast', () => {
  const toastMock = vi.fn() as unknown as { error: ReturnType<typeof vi.fn> };
  toastMock.error = vi.fn();
  return { default: toastMock };
});

describe('useAudioRecorder', () => {
  let mockStream: MediaStream;
  let mockTrack: { stop: ReturnType<typeof vi.fn> };
  let mockMediaRecorder: MediaRecorder;
  let mockGetUserMedia: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();

    mockTrack = {
      stop: vi.fn(),
    };
    mockStream = {
      getTracks: vi.fn().mockReturnValue([mockTrack]),
    } as unknown as MediaStream;

    const recorderInstance = {
      state: 'inactive' as 'inactive' | 'recording' | 'paused',
      mimeType: 'audio/webm',
      start: vi.fn().mockImplementation(function(this: any) {
        this.state = 'recording';
      }),
      stop: vi.fn().mockImplementation(function(this: any) {
        this.state = 'inactive';
        if (this.onstop) {
          this.onstop.call(this, new Event('stop'));
        }
      }),
      ondataavailable: null as ((this: MediaRecorder, ev: BlobEvent) => void) | null,
      onstop: null as ((this: MediaRecorder, ev: Event) => void) | null,
    };
    mockMediaRecorder = recorderInstance as unknown as MediaRecorder;

    mockGetUserMedia = vi.fn().mockResolvedValue(mockStream);

    // @ts-expect-error - Mocking navigator.mediaDevices
    global.navigator.mediaDevices = {
      getUserMedia: mockGetUserMedia,
    };

    // @ts-expect-error - Mocking MediaRecorder
    global.MediaRecorder = vi.fn().mockImplementation(() => mockMediaRecorder);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should detect browser support correctly', () => {
      const { result } = renderHook(() => useAudioRecorder());
      expect(result.current.isSupported).toBe(true);
    });

    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useAudioRecorder());

      expect(result.current.isRecording).toBe(false);
      expect(result.current.duration).toBe(0);
      expect(result.current.error).toBeNull();
      expect(result.current.isMaxDurationReached).toBe(false);
    });
  });

  describe('Recording Lifecycle', () => {
    it('should start recording successfully', async () => {
      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.startRecording();
      });

      expect(mockGetUserMedia).toHaveBeenCalledWith({ audio: true });
      expect(MediaRecorder).toHaveBeenCalledWith(mockStream);
      expect(mockMediaRecorder.start).toHaveBeenCalledWith(100);
      expect(result.current.isRecording).toBe(true);
      expect(result.current.duration).toBe(0);
    });

    it('should handle permission denied error', async () => {
      const permissionError = new DOMException('Permission denied', 'NotAllowedError');
      mockGetUserMedia.mockRejectedValue(permissionError);

      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.startRecording();
      });

      expect(result.current.error).toContain('دسترسی به میکروفن رد شد');
      expect(result.current.isRecording).toBe(false);
    });

    it('should increment duration every second while recording', async () => {
      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.startRecording();
      });

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.duration).toBe(3);
    });

    it('should stop recording and return blob with duration', async () => {
      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.startRecording();
      });

      act(() => {
        if (mockMediaRecorder.ondataavailable) {
          mockMediaRecorder.ondataavailable({ data: new Blob(['audio data'], { type: 'audio/webm' }) } as BlobEvent);
        }
      });

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      let stopResult: Awaited<ReturnType<typeof result.current.stopRecording>> | undefined;
      await act(async () => {
        stopResult = await result.current.stopRecording();
      });

      expect(mockMediaRecorder.stop).toHaveBeenCalled();
      expect(stopResult).not.toBeNull();
      expect(stopResult?.duration).toBe(2);
      expect(stopResult?.blob.size).toBeGreaterThan(0);
      expect(result.current.isRecording).toBe(false);
      expect(result.current.duration).toBe(0);
    });

    it('should return null if stopped immediately (empty blob)', async () => {
      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.startRecording();
      });

      let stopResult: Awaited<ReturnType<typeof result.current.stopRecording>> | undefined;
      await act(async () => {
        stopResult = await result.current.stopRecording();
      });

      expect(stopResult).toBeNull();
    });

    it('should cancel recording without returning result', async () => {
      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.startRecording();
      });

      act(() => {
        result.current.cancelRecording();
      });

      expect(mockMediaRecorder.stop).toHaveBeenCalled();
      expect(result.current.isRecording).toBe(false);
    });
  });

  describe('Resource Management', () => {
    it('should cleanup stream and timer on unmount', async () => {
      const { result, unmount } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.startRecording();
      });

      unmount();

      expect(mockTrack.stop).toHaveBeenCalled();
    });

    it('should handle max duration reached', async () => {
      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.startRecording();
      });

      act(() => {
        vi.advanceTimersByTime(MAX_RECORD_DURATION * 1000);
      });

      expect(result.current.isMaxDurationReached).toBe(true);
    });
  });
});
