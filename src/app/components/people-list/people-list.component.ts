import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { Person } from '../../models/person.model';
import { PeopleService } from '../../services/people.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-people-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="container">
      <header class="d-flex justify-between align-center mb-3">
        <h1>People Management</h1>
        <button class="btn btn-primary" [routerLink]="['/people/new']">
          Add New Person
        </button>
      </header>

      <div class="card">
        <div class="d-flex justify-between align-center mb-2">
          <h2>People List</h2>
          <div>
            <input 
              type="text" 
              class="form-control" 
              placeholder="Search people..." 
              [formControl]="searchControl"
            >
          </div>
        </div>

        @if (loading) {
          <div class="text-center mt-3 mb-3">
            <p>Loading people...</p>
          </div>
        } @else if (filteredPeople.length === 0) {
          <div class="text-center mt-3 mb-3">
            <p>No people found. Try a different search term or add a new person.</p>
          </div>
        } @else {
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th (click)="sortBy('id')" style="cursor: pointer">
                    ID
                    @if (sortColumn === 'id') {
                      @if (sortDirection === 'asc') { ↑ } @else { ↓ }
                    }
                  </th>
                  <th (click)="sortBy('name')" style="cursor: pointer">
                    Name
                    @if (sortColumn === 'name') {
                      @if (sortDirection === 'asc') { ↑ } @else { ↓ }
                    }
                  </th>
                  <th (click)="sortBy('email')" style="cursor: pointer">
                    Email
                    @if (sortColumn === 'email') {
                      @if (sortDirection === 'asc') { ↑ } @else { ↓ }
                    }
                  </th>
                  <th>Phone</th>
                  <th>Company</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (person of filteredPeople; track person.id) {
                  <tr>
                    <td>{{ person.id }}</td>
                    <td>{{ person.name }}</td>
                    <td>{{ person.email }}</td>
                    <td>{{ person.phone }}</td>
                    <td>{{ person.company?.name }}</td>
                    <td>
                      <div class="d-flex">
                        <button 
                          class="btn btn-primary mr-1" 
                          [routerLink]="['/people', person.id, 'edit']"
                        >
                          Edit
                        </button>
                        <button 
                          class="btn btn-danger ml-1" 
                          [routerLink]="['/people', person.id, 'delete']"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `
})
export class PeopleListComponent implements OnInit, OnDestroy {
  people: Person[] = [];
  filteredPeople: Person[] = [];
  loading = true;
  searchControl = new FormControl('');
  sortColumn = 'id';
  sortDirection: 'asc' | 'desc' = 'asc';
  
  private destroy$ = new Subject<void>();

  constructor(
    private peopleService: PeopleService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadPeople();
    
    // Setup search with debounce
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(value => {
      this.filterPeople(value || '');
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPeople(): void {
    this.loading = true;
    this.peopleService.getAllPeople().subscribe({
      next: (people) => {
        this.people = people;
        this.filteredPeople = [...people];
        this.applySorting();
        this.loading = false;
      },
      error: (error) => {
        this.toastService.showError('Failed to load people: ' + error.message);
        this.loading = false;
      }
    });
  }

  filterPeople(searchTerm: string): void {
    if (!searchTerm.trim()) {
      this.filteredPeople = [...this.people];
    } else {
      const term = searchTerm.toLowerCase();
      this.filteredPeople = this.people.filter(person => 
        person.name.toLowerCase().includes(term) || 
        person.email.toLowerCase().includes(term) ||
        (person.company?.name && person.company.name.toLowerCase().includes(term))
      );
    }
    
    this.applySorting();
  }

  sortBy(column: string): void {
    if (this.sortColumn === column) {
      // Toggle direction if same column
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // New column, default to ascending
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    
    this.applySorting();
  }

  private applySorting(): void {
    const direction = this.sortDirection === 'asc' ? 1 : -1;
    
    this.filteredPeople.sort((a, b) => {
      // Handle nested properties and null values
      const aValue = this.getPropertyValue(a, this.sortColumn);
      const bValue = this.getPropertyValue(b, this.sortColumn);
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return direction * aValue.localeCompare(bValue);
      }
      
      return direction * (aValue < bValue ? -1 : aValue > bValue ? 1 : 0);
    });
  }

  private getPropertyValue(obj: any, path: string): any {
    const parts = path.split('.');
    let result = obj;
    
    for (const part of parts) {
      if (result == null) return null;
      result = result[part];
    }
    
    return result;
  }
}