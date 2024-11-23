export interface Customer {
  id: number;
  dni: string;
  name: string;
  surname: string;
  cellphone: string;
  email: string;
  genderId: number;
  gender: string;
}

export interface CreatedCustomer {
  message: string;
  customer: Customer;
}
