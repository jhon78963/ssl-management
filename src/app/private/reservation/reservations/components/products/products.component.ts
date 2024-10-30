import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { PickListModule } from 'primeng/picklist';
import { ReservationProductsService } from '../../services/reservation-products.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-add-products',
  standalone: true,
  imports: [TableModule, ToastModule, PickListModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
})
export class ProductsAddComponent implements OnInit {
  @Input() reservationId: number = 0;
  leftProducts: Product[] = [];
  selectedProducts: Product | undefined;
  sourceProducts: Product[] | undefined;
  targetProducts: Product[] | undefined;

  constructor(
    private readonly dynamicDialogConfig: DynamicDialogConfig,
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
        this.cdr.markForCheck();
      },
      error: () => {},
    });

    this.reservationProductsService.findAll(id).subscribe({
      next: (response: any) => {
        this.targetProducts = response;
        this.cdr.markForCheck();
      },
      error: () => {},
    });
  }

  addProduct(event: any): void {
    const products = event.items;
    products.map((product: any) => {
      this.reservationProductsService
        .add(this.reservationId, product.id)
        .subscribe({
          next: () => {},
          error: () => {},
        });
    });
    // this.updateProducts(this.reservationId);
  }

  removeProduct(event: any): void {
    const products = event.items;
    products.map((product: any) => {
      this.reservationProductsService
        .remove(this.reservationId, product.id)
        .subscribe({
          next: () => {},
          error: () => {},
        });
    });
    // this.updateProducts(this.reservationId);
  }
}
