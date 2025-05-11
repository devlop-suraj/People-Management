import { bootstrapApplication } from '@angular/platform-browser';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { appConfig } from './app/app.config';
import { ToastComponent } from './app/components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent],
  template: `
    <main>
      <router-outlet></router-outlet>
      <app-toast></app-toast>
    </main>
  `
})
export class App {}

bootstrapApplication(App, appConfig)
  .catch(err => console.error(err));