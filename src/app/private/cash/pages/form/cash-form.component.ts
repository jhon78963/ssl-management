import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { KeyFilterModule } from 'primeng/keyfilter';
import { currentDateTime } from '../../../../utils/dates';
import { CommonModule, DatePipe } from '@angular/common';
import { SharedModule } from '../../../../shared/shared.module';
import { CashesService } from '../../services/cashes.service';
import { CashOperation } from '../../models/cash.model';
import { CashService } from '../../../reservation/services/cash.service';

@Component({
  selector: 'app-cash-form',
  standalone: true,
  imports: [CommonModule, KeyFilterModule, ReactiveFormsModule, SharedModule],
  templateUrl: './cash-form.component.html',
  styleUrl: './cash-form.component.scss',
  providers: [DatePipe],
})
export class CashFormComponent implements OnInit {
  constructor(
    private readonly datePipe: DatePipe,
    private readonly formBuilder: FormBuilder,
    private readonly dynamicDialogRef: DynamicDialogRef,
    private readonly dynamicDialogConfig: DynamicDialogConfig,
    private readonly cashesService: CashesService,
    private readonly cashService: CashService,
  ) {}

  form: FormGroup = this.formBuilder.group({
    cashTypeId: [this.dynamicDialogConfig.data.type, Validators.required],
    date: [currentDateTime(this.datePipe), Validators.required],
    description: [null, Validators.required],
    amount: [null, Validators.required],
  });

  ngOnInit(): void {
    console.log(this.form.value);
  }

  cashSaveButton() {
    const cashOperation = new CashOperation(this.form.value);
    this.cashesService.create(cashOperation).subscribe({
      next: () => {
        this.cashService.getCashTotal().subscribe();
        this.dynamicDialogRef.close();
      },
    });
  }

  get isFormValid(): boolean {
    return this.form.valid;
  }
}
