import { Component } from '@angular/core';
import { SharedModule } from '../../../../../shared/shared.module';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.scss',
})
export class RoomsComponent {}
