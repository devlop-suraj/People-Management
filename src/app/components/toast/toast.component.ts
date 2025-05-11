import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Toast, ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toasts; track toast.id) {
        <div class="toast toast-{{ toast.type }}" @fadeIn>
          {{ toast.message }}
        </div>
      }
    </div>
  `,
  animations: [
    // Animation will be added in global styles
  ]
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private subscription = new Subscription();

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.subscription = this.toastService.toasts$.subscribe(toast => {
      if (toast.message === 'REMOVE') {
        this.toasts = this.toasts.filter(t => t.id !== toast.id);
      } else {
        this.toasts.push(toast);
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}