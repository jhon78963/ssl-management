export interface ICash {
  id: number;
  cash: string;
  cashType: string;
  cashTypeKey: string;
  schedule: string;
  pettyCash: number;
  amount: number;
  employee: string;
}

export class Cash {
  id: number;
  cash: string;
  cashType: string;
  cashTypeKey: string;
  schedule: string;
  pettyCash: number;
  amount: number;
  employee: string;
  constructor(cash: ICash) {
    this.id = cash.id;
    this.cash = cash.cash;
    this.cashType = cash.cashType;
    this.cashTypeKey = cash.cashTypeKey;
    this.schedule = cash.schedule;
    this.pettyCash = cash.pettyCash;
    this.amount = cash.amount;
    this.employee = cash.employee;
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
