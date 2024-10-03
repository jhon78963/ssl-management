import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { ReviewsService } from '../../services/reviews.service';
import { SharedModule } from '../../../../../shared/shared.module';
import { Rating, Review } from '../../models/reviews.model';

@Component({
  selector: 'app-reviews-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SharedModule],
  templateUrl: './reviews-form.component.html',
  styleUrl: './reviews-form.component.scss',
})
export class ReviewsFormComponent implements OnInit {
  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly reviewsService: ReviewsService,
    private readonly dialogRef: DynamicDialogRef,
    private readonly dynamicDialogConfig: DynamicDialogConfig,
  ) {}

  ratings: Rating[] = [
    { id: 1, rating: '1 estrella' },
    { id: 3, rating: '3 estrellas' },
    { id: 2, rating: '2 estrellas' },
    { id: 4, rating: '4 estrellas' },
    { id: 5, rating: '5 estrellas' },
  ];

  form: FormGroup = this.formBuilder.group({
    customerName: ['', Validators.required],
    description: ['', Validators.required],
    rating: ['', Validators.required],
    roomId: [1, Validators.required],
  });

  ngOnInit(): void {
    if (this.dynamicDialogConfig.data.id) {
      const id = this.dynamicDialogConfig.data.id;
      this.reviewsService.getOne(id).subscribe((response: Review) => {
        this.form.patchValue(response);
      });
    }
  }

  buttonSaveReview() {
    if (this.form) {
      const review = new Review(this.form.value);
      if (this.dynamicDialogConfig.data.id) {
        const id = this.dynamicDialogConfig.data.id;
        this.reviewsService.edit(id, review).subscribe({
          next: () => this.dialogRef.close(),
          error: () => this.dialogRef.close(),
        });
      } else {
        this.reviewsService.create(review).subscribe({
          next: () => this.dialogRef.close(),
          error: () => this.dialogRef.close(),
        });
      }
    }
  }

  get isFormValid(): boolean {
    return this.form.valid;
  }
}
