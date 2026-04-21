/**
 * Rooms Feature - Public API
 *
 * @module features/rooms
 */

export { RoomList } from './components/RoomList';
export { RoomItem } from './components/RoomItem';
export { CreateRoomModal } from './components/CreateRoomModal';
export { SearchBar } from './components/SearchBar';
export { useRooms } from './hooks/useRooms';
export { useCreateRoom } from './hooks/useCreateRoom';
export { useRoomActions } from './hooks/useRoomActions';
export type { Room, RoomType, LastMessage, CreateRoomInput, UpdateRoomInput } from './types';
