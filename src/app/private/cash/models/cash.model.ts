export interface Cash {
  id?: number;
  date: string;
  cash: string;
  cashType: string;
  cashTypeId: number;
  schedule: string;
  pettyCash: number;
  description: string;
  amount: number;
  employee: string;
}

export class CashOperation {
  cashTypeId: number;
  date: string;
  description: string;
  amount: number;
  constructor(cash: Cash) {
    this.cashTypeId = cash.cashTypeId;
    this.date = cash.date;
    this.description = cash.description;
    this.amount = cash.amount;
  }
}

export interface Paginate {
  total: number;
  pages: number;
}

export interface CashListResponse {
  data: Cash[];
  paginate: Paginate;
}
