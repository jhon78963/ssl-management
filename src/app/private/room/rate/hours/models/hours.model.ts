export interface IHour {
  id: number;
  durationNumber: number;
  duration: string;
}

export class Hour {
  id: number;
  durationNumber: number;
  duration: string;

  constructor(hour: IHour) {
    this.id = hour.id;
    this.durationNumber = hour.durationNumber;
    this.duration = hour.duration;
  }
}

export interface Paginate {
  total: number;
  pages: number;
}

export interface HourListResponse {
  data: Hour[];
  paginate: Paginate;
}
