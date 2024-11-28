import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';
import { debounceTime, Observable, Subject } from 'rxjs';
import { Product } from '../../models/product.model';
import { ProductsService } from '../../services/products.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TooltipModule,
    CheckboxModule,
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
})
export class ProductsComponent implements OnInit {
  @Input() selectedProducts: any[] = [];
  @Output() productChanges = new EventEmitter<Product>();
  nameQuery: string = '';
  checked: boolean = false;
  private nameSearchTermSubject = new Subject<string>();

  constructor(private readonly productsService: ProductsService) {}
  ngOnInit(): void {
    this.getProducts();
    this.nameSearchTermSubject.pipe(debounceTime(600)).subscribe(() => {
      this.getProducts(this.nameQuery);
    });
  }

  async getProducts(name: string = this.nameQuery): Promise<void> {
    this.productsService.callGetList(name).subscribe();
  }

  get products(): Observable<Product[]> {
    return this.productsService.getList();
  }

  clearFilter() {
    this.nameQuery = '';
    this.onSearchTermChange('');
  }

  onSearchTermChange(term: any) {
    this.nameSearchTermSubject.next(term);
  }

  addProduct(product: Product) {
    // ++product.quantity;
    // product.total = product.quantity * product.price;
    product.isAdd = true;
    product.isChecked = false;
    this.productChanges.emit(product);
  }

  subProduct(product: Product) {
    // product.quantity--;
    // product.total = product.quantity * product.price;
    product.isAdd = false;
    product.isChecked = false;
    this.productChanges.emit(product);
  }

  changeStatus(product: Product) {
    product.isChecked = true;
    this.productChanges.emit(product);
  }
}
