import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { SharedModule } from '../../../../shared/shared.module';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { KeyFilterModule } from 'primeng/keyfilter';
import {
  Cash,
  CashOperation,
  CashType,
  CashUpdate,
  CurrentCash,
} from '../../models/cash.model';
import { CashService } from '../../services/cash.service';
import { currentDateTime } from '../../../../utils/dates';

@Component({
  selector: 'app-cash',
  standalone: true,
  imports: [CommonModule, SharedModule, ReactiveFormsModule, KeyFilterModule],
  templateUrl: './cash.component.html',
  styleUrl: './cash.component.scss',
  providers: [DatePipe],
})
export class CashComponent implements OnInit {
  cashType: CashType = { id: 0, key: '', label: '' };
  currentCash: CurrentCash = {
    id: 0,
    description: '',
    status: '',
    name: '',
    pettyCashAmount: 0,
  };
  total: any;

  constructor(
    private readonly datePipe: DatePipe,
    private readonly formBuilder: FormBuilder,
    private readonly dialogRef: DynamicDialogRef,
    private readonly dynamicDialogConfig: DynamicDialogConfig,
    private readonly cashService: CashService,
  ) {}

  form: FormGroup = this.formBuilder.group({
    cashId: [null],
    cashTypeId: [null],
    date: [null],
    pettyCashAmount: [null],
    amount: [null, Validators.required],
    name: [null],
  });

  ngOnInit(): void {
    this.cashType = this.dynamicDialogConfig.data.cashType;
    this.total = this.dynamicDialogConfig.data.total;
    this.form.get('amount')?.setValue(this.total.source._value);
  }

  getData(cashId: number | undefined) {
    const cash = new CashOperation(this.form.value);
    cash.date = currentDateTime(this.datePipe);
    cash.cashTypeId = this.cashType.id;
    cash.cashId = cashId;
    return cash;
  }

  createOperation(cashId: number | undefined) {
    this.cashService.createOperation(this.getData(cashId)).subscribe({
      next: () => {
        if (this.cashType.id == 4) {
          this.cashService.updateCashTotal(0);
          const body = {
            status: 'CLOSE',
          };
          const cash = new CashUpdate(body);
          this.cashService.updateCash(cashId!, cash).subscribe();
        }
        this.cashService.getCashValidate().subscribe();
        this.clearData();
        this.dialogRef.close();
      },
    });
  }

  cashSaveButton() {
    this.cashService.currentCash().subscribe({
      next: (currentCash: CurrentCash) => {
        if (Object.keys(currentCash).length === 0) {
          const body = {
            description: 'Caja Principal',
            status: 'OPEN',
            name: this.form.get('name')?.value,
            pettyCashAmount: this.form.get('pettyCashAmount')?.value,
          };
          const cash = new Cash(body);
          this.cashService.createCash(cash).subscribe({
            next: (cash: any) => {
              this.createOperation(cash.id);
            },
          });
        } else {
          this.createOperation(currentCash.id);
        }
      },
    });
  }

  clearData() {
    this.form.get('amount')?.setValue(null);
    this.form.get('pettyCashAmount')?.setValue(null);
    this.form.get('name')?.setValue(null);
  }

  get isFormValid(): boolean {
    return this.form.valid;
  }
}
