import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../../shared/shared.module';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { KeyFilterModule } from 'primeng/keyfilter';

@Component({
  selector: 'app-cash',
  standalone: true,
  imports: [CommonModule, SharedModule, ReactiveFormsModule, KeyFilterModule],
  templateUrl: './cash.component.html',
  styleUrl: './cash.component.scss',
})
export class CashComponent {
  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly dialogRef: DynamicDialogRef,
    private readonly dynamicDialogConfig: DynamicDialogConfig,
  ) {}
  form: FormGroup = this.formBuilder.group({
    pettyCashAmount: [null, Validators.required],
    initialAmount: [null, Validators.required],
  });

  cashSaveButton() {}

  get isFormValid(): boolean {
    return this.form.valid;
  }
}
