export interface Product {
  id: number;
  name: string;
  productTypeId: number;
  productType?: string;
  price: number;
  priceString?: string;
}
