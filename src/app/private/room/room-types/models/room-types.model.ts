export interface IRoomType {
  id: number;
  description: string;
  capacity: number;
  pricePerCapacity: number;
  pricePerAdditionalPerson: number;
  ageFree: number;
}

export class RoomType {
  id: number;
  description: string;
  capacity: number;
  pricePerCapacity: number;
  pricePerAdditionalPerson: number;
  ageFree: number;
  constructor(roomType: IRoomType) {
    this.id = roomType.id;
    this.description = roomType.description;
    this.capacity = roomType.capacity;
    this.pricePerCapacity = roomType.pricePerCapacity;
    this.pricePerAdditionalPerson = roomType.pricePerAdditionalPerson;
    this.ageFree = roomType.ageFree;
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
