export interface Facility {
  id: number;
  number: string;
  status: string;
  price: number;
}

export interface Paginate {
  total: number;
  pages: number;
}

export interface FacilityListResponse {
  data: Facility[];
  paginate: Paginate;
}
