import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, delay, map, tap } from 'rxjs/operators';
import { Person } from '../models/person.model';

@Injectable({
  providedIn: 'root'
})
export class PeopleService {
  // Using JSONPlaceholder as demo API
  private apiUrl = 'https://jsonplaceholder.typicode.com/users';
  
  // In-memory cache for demo purposes
  private peopleCache: Person[] = [];

  constructor(private http: HttpClient) {}

  /**
   * Get all people from the API
   */
  getAllPeople(): Observable<Person[]> {
    // If we have cached data, return it
    if (this.peopleCache.length > 0) {
      return of(this.peopleCache);
    }

    return this.http.get<Person[]>(this.apiUrl).pipe(
      tap(people => this.peopleCache = people),
      catchError(this.handleError)
    );
  }

  /**
   * Get a single person by ID
   */
  getPersonById(id: number): Observable<Person> {
    // Check cache first
    const cachedPerson = this.peopleCache.find(p => p.id === id);
    if (cachedPerson) {
      return of(cachedPerson);
    }

    return this.http.get<Person>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Create a new person
   */
  createPerson(person: Omit<Person, 'id'>): Observable<Person> {
    return this.http.post<Person>(this.apiUrl, person).pipe(
      tap(newPerson => {
        this.peopleCache.push(newPerson);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Update an existing person
   */
  updatePerson(id: number, person: Partial<Person>): Observable<Person> {
    return this.http.put<Person>(`${this.apiUrl}/${id}`, person).pipe(
      tap(updatedPerson => {
        // Update cache
        const index = this.peopleCache.findIndex(p => p.id === id);
        if (index >= 0) {
          this.peopleCache[index] = { ...this.peopleCache[index], ...updatedPerson };
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Delete a person by ID
   */
  deletePerson(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        // Remove from cache
        this.peopleCache = this.peopleCache.filter(p => p.id !== id);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: any) {
    console.error('API error:', error);
    return throwError(() => new Error(error.message || 'Server error'));
  }
}