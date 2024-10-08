import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { FileUploadModule } from 'primeng/fileupload';
import { TooltipModule } from 'primeng/tooltip';

import { RoomImagesService } from '../../../services/room-images.service';

import { Image } from '../../../models/rooms.model';
import { environment } from '../../../../../../../environments/environment';

@Component({
  selector: 'app-images',
  standalone: true,
  imports: [CommonModule, FormsModule, FileUploadModule, TooltipModule],
  templateUrl: './images.component.html',
  styleUrl: './images.component.scss',
})
export class AddImagesComponent implements OnInit {
  apiUrl = environment.BASE_URL;
  uploadedFiles: Image[] = [];
  url: string = '';

  constructor(
    private readonly dynamicDialogConfig: DynamicDialogConfig,
    private readonly roomImagesService: RoomImagesService,
  ) {}

  ngOnInit(): void {
    const id = this.dynamicDialogConfig.data.id;
    this.url = `${this.apiUrl}/images/${id}/add`;
    this.updateImages(id);
  }

  updateImages(id: number): void {
    this.roomImagesService.findAll(id).subscribe({
      next: (response: Image[]) => {
        this.uploadedFiles = response;
      },
      error: () => {},
    });
  }

  removeImage(imageId: number): void {
    const roomId = this.dynamicDialogConfig.data.id;
    this.roomImagesService.remove(roomId, imageId).subscribe({
      next: () => this.updateImages(roomId),
      error: () => {},
    });
  }

  onUpload(): void {
    const id = this.dynamicDialogConfig.data.id;
    this.updateImages(id);
  }
}
