import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Person } from '../../models/person.model';
import { PeopleService } from '../../services/people.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-person-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="container">
      <div class="card">
        <header class="d-flex justify-between align-center mb-3">
          <h1>{{ isNewPerson ? 'Add New Person' : 'Edit Person' }}</h1>
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
        } @else {
          <form [formGroup]="personForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label for="name" class="form-label">Name *</label>
              <input type="text" id="name" formControlName="name" class="form-control">
              @if (f['name'].touched && f['name'].invalid) {
                <div class="form-error">
                  Name is required and must be at least 3 characters.
                </div>
              }
            </div>

            <div class="form-group">
              <label for="email" class="form-label">Email *</label>
              <input type="email" id="email" formControlName="email" class="form-control">
              @if (f['email'].touched && f['email'].invalid) {
                <div class="form-error">
                  Please enter a valid email address.
                </div>
              }
            </div>

            <div class="form-group">
              <label for="phone" class="form-label">Phone *</label>
              <input type="tel" id="phone" formControlName="phone" class="form-control">
              @if (f['phone'].touched && f['phone'].invalid) {
                <div class="form-error">
                  Phone number is required.
                </div>
              }
            </div>

            <h3 class="mt-3 mb-2">Address Information</h3>
            
            <div formGroupName="address">
              <div class="form-group">
                <label for="street" class="form-label">Street</label>
                <input type="text" id="street" formControlName="street" class="form-control">
              </div>

              <div class="d-flex">
                <div class="form-group mr-2" style="flex: 1">
                  <label for="city" class="form-label">City</label>
                  <input type="text" id="city" formControlName="city" class="form-control">
                </div>

                <div class="form-group" style="flex: 1">
                  <label for="zipcode" class="form-label">Zipcode</label>
                  <input type="text" id="zipcode" formControlName="zipcode" class="form-control">
                </div>
              </div>
            </div>

            <h3 class="mt-3 mb-2">Company Information</h3>
            
            <div formGroupName="company">
              <div class="form-group">
                <label for="companyName" class="form-label">Company Name</label>
                <input type="text" id="companyName" formControlName="name" class="form-control">
              </div>

              <div class="form-group">
                <label for="catchPhrase" class="form-label">Catch Phrase</label>
                <input type="text" id="catchPhrase" formControlName="catchPhrase" class="form-control">
              </div>
            </div>

            <div class="d-flex justify-between mt-3">
              <button type="button" class="btn btn-accent" (click)="goBack()">
                Cancel
              </button>
              <button 
                type="submit" 
                class="btn btn-primary" 
                [disabled]="personForm.invalid || submitting"
              >
                {{ submitting ? 'Saving...' : (isNewPerson ? 'Create Person' : 'Update Person') }}
              </button>
            </div>
          </form>
        }
      </div>
    </div>
  `
})
export class PersonEditComponent implements OnInit {
  personForm!: FormGroup;
  personId?: number;
  isNewPerson = true;
  loading = false;
  submitting = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private peopleService: PeopleService,
    private toastService: ToastService
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    
    if (idParam && idParam !== 'new') {
      this.isNewPerson = false;
      this.personId = +idParam;
      this.loadPersonData();
    }
  }

  get f() {
    return this.personForm.controls;
  }

  createForm(): void {
    this.personForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: this.fb.group({
        street: [''],
        city: [''],
        zipcode: ['']
      }),
      company: this.fb.group({
        name: [''],
        catchPhrase: ['']
      })
    });
  }

  loadPersonData(): void {
    if (!this.personId) return;
    
    this.loading = true;
    this.peopleService.getPersonById(this.personId).subscribe({
      next: (person) => {
        this.patchFormValues(person);
        this.loading = false;
      },
      error: (error) => {
        this.error = `Failed to load person: ${error.message}`;
        this.toastService.showError(this.error);
        this.loading = false;
      }
    });
  }

  patchFormValues(person: Person): void {
    // First patch the main form fields
    this.personForm.patchValue({
      name: person.name,
      email: person.email,
      phone: person.phone
    });
    
    // Then handle the nested objects which might be undefined
    if (person.address) {
      this.personForm.get('address')?.patchValue(person.address);
    }
    
    if (person.company) {
      this.personForm.get('company')?.patchValue(person.company);
    }
  }

  onSubmit(): void {
    if (this.personForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.personForm.controls).forEach(key => {
        const control = this.personForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.submitting = true;
    const personData = this.personForm.value;

    if (this.isNewPerson) {
      this.createNewPerson(personData);
    } else {
      this.updateExistingPerson(personData);
    }
  }

  createNewPerson(personData: Partial<Person>): void {
    this.peopleService.createPerson(personData as Omit<Person, 'id'>).subscribe({
      next: () => {
        this.toastService.showSuccess('Person created successfully!');
        this.router.navigate(['/people']);
      },
      error: (error) => {
        this.toastService.showError('Failed to create person: ' + error.message);
        this.submitting = false;
      }
    });
  }

  updateExistingPerson(personData: Partial<Person>): void {
    if (!this.personId) return;
    
    this.peopleService.updatePerson(this.personId, personData).subscribe({
      next: () => {
        this.toastService.showSuccess('Person updated successfully!');
        this.router.navigate(['/people']);
      },
      error: (error) => {
        this.toastService.showError('Failed to update person: ' + error.message);
        this.submitting = false;
      }
    });
  }

  goBack(): void {
    this.location.back();
  }
}