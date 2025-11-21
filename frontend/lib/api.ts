// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const mockRooms: Room[] = [
  {
    id: '1',
    roomNumber: '101',
    type: 'single',
    price: 1200,
    floor: 1,
    availability: true,
    description: 'Cozy single room with city view',
    images: ['/rooms/101-1.jpg', '/rooms/101-2.jpg', '/rooms/101-3.jpg'],
    createdAt: '2025-01-01',
  },
  {
    id: '2',
    roomNumber: '201',
    type: 'double',
    price: 2200,
    floor: 2,
    availability: false,
    description: 'Spacious double room with balcony',
    images: ['/rooms/201-1.jpg', '/rooms/201-2.jpg', '/rooms/201-3.jpg'],
    createdAt: '2025-01-02',
  },
];

export const roomApi = {
  getAll: async (): Promise<Room[]> => {
    await delay(600);
    return [...mockRooms];
  },

  create: async (data: Omit<Room, 'id' | 'createdAt'>): Promise<Room> => {
    await delay(800);
    const newRoom: Room = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    mockRooms.push(newRoom);
    return newRoom;
  },

  update: async (id: string, data: Partial<Room>): Promise<Room> => {
    await delay(700);
    const index = mockRooms.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Room not found');
    mockRooms[index] = { ...mockRooms[index], ...data };
    return mockRooms[index];
  },

  delete: async (id: string): Promise<void> => {
    await delay(500);
    const index = mockRooms.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Room not found');
    mockRooms.splice(index, 1);
  },
};