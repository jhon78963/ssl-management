export interface IReview {
  id: number;
  customerName: string;
  description: string;
  rating: string;
}

export class Review {
  id: number;
  customerName: string;
  description: string;
  rating: string;

  constructor(review: IReview) {
    this.id = review.id;
    this.customerName = review.customerName;
    this.description = review.description;
    this.rating = review.rating;
  }
}

export interface Paginate {
  total: number;
  pages: number;
}

export interface ReviewListResponse {
  data: Review[];
  paginate: Paginate;
}
