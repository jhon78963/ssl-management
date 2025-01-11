export interface CashType {
  id: number;
  key: string;
  label: string;
}

export interface CashTotal {
  total: number;
}

export interface ICashOperation {
  id?: number;
  cashId: number;
  cashTypeId: number;
  date: string;
  description: string;
  amount: number;
}

export class CashOperation {
  id?: number;
  cashId?: number;
  cashTypeId: number;
  date: string | null;
  description: string;
  amount: number;
  constructor(cash: ICashOperation) {
    this.id = cash.id;
    this.cashId = cash.cashId;
    this.cashTypeId = cash.cashTypeId;
    this.date = cash.date;
    this.amount = cash.amount;
    this.description = cash.description;
  }
}

export interface CurrentCash {
  id?: number;
  description: string;
  pettyCashAmount: number;
  name: string;
  status: string;
}

export class Cash {
  id?: number;
  description?: string;
  pettyCashAmount: number;
  name: string;
  status: string;
  constructor(cash: CurrentCash) {
    this.id = cash.id;
    this.description = cash.description;
    this.pettyCashAmount = cash.pettyCashAmount;
    this.name = cash.name;
    this.status = cash.status;
  }
}

export interface ICash {
  id?: number;
  status: string;
}

export class CashUpdate {
  id?: number;
  status: string;
  constructor(cash: ICash) {
    this.id = cash.id;
    this.status = cash.status;
  }
}
