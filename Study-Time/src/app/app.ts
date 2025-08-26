import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
  imports: [RouterOutlet], // 👈 This is the key part
})
export class AppComponent {}
