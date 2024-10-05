export interface IRoomType {
  id: number;
  description: string;
}

export class RoomType {
  id: number;
  description: string;
  constructor(roomType: IRoomType) {
    this.id = roomType.id;
    this.description = roomType.description;
  }
}

export interface Paginate {
  total: number;
  pages: number;
}

export interface RoomTypeListResponse {
  data: RoomType[];
  paginate: Paginate;
}
