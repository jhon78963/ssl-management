import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { FileUploadModule } from 'primeng/fileupload';
import { Image } from '../../../models/rooms.model';
import { TooltipModule } from 'primeng/tooltip';
import { RoomImagesService } from '../../../services/room-images.service';

@Component({
  selector: 'app-images',
  standalone: true,
  imports: [CommonModule, FormsModule, FileUploadModule, TooltipModule],
  templateUrl: './images.component.html',
  styleUrl: './images.component.scss',
  providers: [MessageService],
})
export class AddImagesComponent implements OnInit {
  uploadedFiles: Image[] = [];

  constructor(
    private messageService: MessageService,
    private readonly dynamicDialogConfig: DynamicDialogConfig,
    private readonly roomImagesService: RoomImagesService,
  ) {}

  ngOnInit(): void {
    const id = this.dynamicDialogConfig.data.id;
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
