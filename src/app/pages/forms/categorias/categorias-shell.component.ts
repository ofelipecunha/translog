import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-categorias-shell',
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class CategoriasShellComponent {}
