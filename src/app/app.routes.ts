import { Routes } from '@angular/router';
import { PeopleListComponent } from './components/people-list/people-list.component';
import { PersonEditComponent } from './components/person-edit/person-edit.component';
import { PersonDeleteComponent } from './components/person-delete/person-delete.component';

export const routes: Routes = [
  { path: '', redirectTo: 'people', pathMatch: 'full' },
  { path: 'people', component: PeopleListComponent },
  { path: 'people/new', component: PersonEditComponent },
  { path: 'people/:id/edit', component: PersonEditComponent },
  { path: 'people/:id/delete', component: PersonDeleteComponent },
  { path: '**', redirectTo: 'people' }
];