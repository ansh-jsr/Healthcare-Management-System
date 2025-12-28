import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse ,HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface Patient {
  id: string;
  Name: string;
  dateOfBirth: string;
  gender: string;
  contactNumber: string;
  status: 'active' | 'inactive';
  lastVisit: string;
}

@Injectable({
  providedIn: 'root',
})
export class PatientService {
  private apiUrl =  'http://localhost:3000/api/patients'; // Example for local backend
  

  constructor(private http: HttpClient) {}

  private getToken(): string | null {
    return localStorage.getItem('token');
  }

   private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const token = this.getToken();
    if (token) headers = headers.set('Authorization',`Bearer ${token}`);
    return headers;
  }


  getAllPatients(): Observable<Patient[]> {
    return this.http.get<{ data: { patients: Patient[] } }>(this.apiUrl).pipe(
      map((response) => response.data.patients || []),
      catchError(this.handleError)
    );
  }
  addPatient(patientData: FormData): Observable<any> {
    let headers = new HttpHeaders();
    const token = this.getToken();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return this.http.post('http://localhost:3000/api/patients', patientData, {headers}).pipe(
      catchError(this.handleError)
    );
  }

  editPatient(id: string, updatedData: any): Observable<any> {
   let headers = new HttpHeaders();
  const token = this.getToken();
  if (token) headers = headers.set('Authorization', `Bearer ${token}`);

  return this.http.put(`http://localhost:3000/api/patients/${id}`, updatedData, {
    headers
  }).pipe(
    catchError(this.handleError)
  );
}

 uploadFile(formData: FormData): Observable<any> {
  const token = this.getToken();
  let headers = new HttpHeaders();
  if (token) headers = headers.set('Authorization', `Bearer ${token}`);

  // DO NOT set 'Content-Type' manually for FormData!
  return this.http.post('http://localhost:3000/api/upload', formData, { headers }).pipe(
    catchError(this.handleError)
  );
}

  

  
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('Error fetching patients:', error);
    return throwError(() => new Error('Failed to load patient records. Please try again later.'));
  }
}