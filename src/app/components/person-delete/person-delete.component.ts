import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Person } from '../../models/person.model';
import { PeopleService } from '../../services/people.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-person-delete',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container">
      <div class="card">
        <header class="d-flex justify-between align-center mb-3">
          <h1>Delete Person</h1>
          <button class="btn btn-accent" (click)="goBack()">
            Back to List
          </button>
        </header>

        @if (loading) {
          <div class="text-center mt-3 mb-3">
            <p>Loading person data...</p>
          </div>
        } @else if (error) {
          <div class="mt-3 mb-3">
            <p class="form-error">{{ error }}</p>
            <button class="btn btn-primary mt-2" (click)="goBack()">
              Return to List
            </button>
          </div>
        } @else if (person) {
          <div class="mb-3">
            <div class="mb-3">
              <h2>Are you sure you want to delete this person?</h2>
              <p class="mt-2 mb-3">This action cannot be undone.</p>
            </div>

            <div class="card mb-3">
              <h3>Person Details</h3>
              <div class="mt-2">
                <p><strong>Name:</strong> {{ person.name }}</p>
                <p><strong>Email:</strong> {{ person.email }}</p>
                <p><strong>Phone:</strong> {{ person.phone }}</p>
                @if (person.company?.name) {
                  <p><strong>Company:</strong> {{ person.company?.name }}</p>
                }
                @if (person.address) {
                  <p><strong>Location:</strong> {{ person.address.city }}</p>
                }
              </div>
            </div>

            <div class="d-flex justify-between mt-3">
              <button type="button" class="btn btn-accent" (click)="goBack()">
                Cancel
              </button>
              <button 
                type="button" 
                class="btn btn-danger" 
                (click)="confirmDelete()"
                [disabled]="deleting"
              >
                {{ deleting ? 'Deleting...' : 'Confirm Delete' }}
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class PersonDeleteComponent implements OnInit {
  personId?: number;
  person?: Person;
  loading = false;
  deleting = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private peopleService: PeopleService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    
    if (idParam) {
      this.personId = +idParam;
      this.loadPersonData();
    } else {
      this.error = 'No person ID provided';
      this.toastService.showError(this.error);
    }
  }

  loadPersonData(): void {
    if (!this.personId) return;
    
    this.loading = true;
    this.peopleService.getPersonById(this.personId).subscribe({
      next: (person) => {
        this.person = person;
        this.loading = false;
      },
      error: (error) => {
        this.error = `Failed to load person: ${error.message}`;
        this.toastService.showError(this.error);
        this.loading = false;
      }
    });
  }

  confirmDelete(): void {
    if (!this.personId) return;
    
    this.deleting = true;
    this.peopleService.deletePerson(this.personId).subscribe({
      next: () => {
        this.toastService.showSuccess('Person deleted successfully!');
        this.router.navigate(['/people']);
      },
      error: (error) => {
        this.toastService.showError('Failed to delete person: ' + error.message);
        this.deleting = false;
      }
    });
  }

  goBack(): void {
    this.location.back();
  }
}