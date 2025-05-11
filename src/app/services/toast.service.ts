import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Toast {
  type: 'success' | 'error';
  message: string;
  id: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastIdCounter = 0;
  private toastsSubject = new Subject<Toast>();
  toasts$ = this.toastsSubject.asObservable();

  constructor() {}

  /**
   * Show a success toast notification
   */
  showSuccess(message: string): void {
    this.show('success', message);
  }

  /**
   * Show an error toast notification
   */
  showError(message: string): void {
    this.show('error', message);
  }

  /**
   * Show a toast notification
   */
  private show(type: 'success' | 'error', message: string): void {
    const id = this.toastIdCounter++;
    this.toastsSubject.next({ type, message, id });
    
    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      this.remove(id);
    }, 5000);
  }

  /**
   * Remove a toast by id
   */
  private remove(id: number): void {
    // Using a special message to indicate removal
    this.toastsSubject.next({ type: 'success', message: 'REMOVE', id });
  }
}