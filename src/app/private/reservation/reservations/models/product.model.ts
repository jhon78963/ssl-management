export interface Product {
  id: number;
  name: string;
  productTypeId: number;
  productType?: string;
  price: number;
  priceString?: string;
  quantity: number;
  quantityPivote: number;
  total: number;
  isPaid: boolean;
  type: string;
}
