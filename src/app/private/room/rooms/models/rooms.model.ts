import { IAmenity } from '../../amenities/models/amenities.model';
import { Image } from '../../images/models/images.model';
import { IRate } from '../../rate/rates/models/rates.model';
import { IReview } from '../../reviews/models/reviews.model';

export interface RoomStatus {
  label: string;
  value: string;
}

export interface IRoom {
  id: number;
  roomNumber: number;
  capacity: number;
  status: string;
  roomStatus: string;
  roomTypeId: number;
  roomType: string;
  customersNumber?: number;
  images: Image[];
  amenities: IAmenity[];
  rates: IRate[];
  reviews: IReview[];
}

export class Room {
  id: number;
  roomNumber: number;
  roomName?: string;
  capacity?: number;
  freeAge?: number;
  pricePerCapacity?: number;
  pricePerAdditionalPerson?: number;
  reservationId?: number;
  status: string;
  roomStatus?: string;
  roomTypeId: number;
  roomType?: string;
  images: Image[];
  amenities: IAmenity[];
  rates: IRate[];
  reviews: IReview[];
  constructor(room: IRoom) {
    this.id = room.id;
    this.roomNumber = room.roomNumber;
    this.status = room.status;
    this.roomTypeId = room.roomTypeId;
    this.images = room.images;
    this.amenities = room.amenities;
    this.rates = room.rates;
    this.reviews = room.reviews;
  }
}

export interface Paginate {
  total: number;
  pages: number;
}

export interface RoomListResponse {
  data: Room[];
  paginate: Paginate;
}
