export type RoomType = 'single' | 'double' | 'triple' | 'suite';

export interface Room {
  id: string;
  roomNumber: string;
  type: RoomType;
  price: number;
  floor: number;
  availability: boolean;
  description: string;
  images: string[]; // URLs of 3 images
  createdAt: string;
}