import { OnInit } from '@angular/core';
import { Component } from '@angular/core';

@Component({
  selector: 'app-menu',
  templateUrl: './app.menu.component.html',
  styleUrl: './app.menu.component.scss',
})
export class AppMenuComponent implements OnInit {
  model: any[] = [];
  lang: any = '';

  ngOnInit(): void {
    this.model = [
      {
        label: 'Administración',
        icon: 'pi pi-home',
        items: [
          {
            label: 'Roles',
            icon: 'pi pi-fw pi-cog',
            routerLink: ['/administration/roles'],
          },
          {
            label: 'Usuarios',
            icon: 'pi pi-fw pi-users',
            routerLink: ['/administration/users'],
          },
        ],
      },
    ];
  }
}
