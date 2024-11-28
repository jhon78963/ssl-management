import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { PickListModule } from 'primeng/picklist';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { Product } from '../../models/product.model';
import { ReservationProductsService } from '../../services/reservation-products.service';

@Component({
  selector: 'app-add-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputNumberModule,
    PickListModule,
    TableModule,
    ToastModule,
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
})
export class ProductsAddComponent implements OnInit {
  @Input() reservationId: number = 0;
  leftProducts: Product[] = [];
  selectedProducts: Product | undefined;
  sourceProducts: Product[] | undefined;
  targetProducts: Product[] | undefined;
  quantity: number = 1;

  constructor(
    private readonly reservationProductsService: ReservationProductsService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.updateProducts(this.reservationId);
  }

  updateProducts(id: number): void {
    this.reservationProductsService.findLeft(id).subscribe({
      next: (response: Product[]) => {
        this.sourceProducts = response;
        this.sourceProducts.map((sourceProduct: Product) => {
          sourceProduct.quantity = sourceProduct.quantity ?? 1;
        });
        this.cdr.markForCheck();
      },
      error: () => {},
    });

    this.reservationProductsService.findAll(id).subscribe({
      next: (response: Product[]) => {
        this.targetProducts = response;
        this.targetProducts.map((targetProduct: Product) => {
          targetProduct.quantity = targetProduct.quantity ?? 1;
        });
        this.cdr.markForCheck();
      },
      error: () => {},
    });
  }

  addProduct(event: any): void {
    const products = event.items;
    products.map((product: any) => {
      this.reservationProductsService
        .add(this.reservationId, product.id, product.quantity)
        .subscribe({
          next: () => {},
          error: () => {},
        });
    });
  }

  removeProduct(event: any): void {
    const products = event.items;
    products.map((product: any) => {
      this.reservationProductsService
        .remove(this.reservationId, product.id, product.quantity)
        .subscribe({
          next: () => {},
          error: () => {},
        });
    });
  }
}
