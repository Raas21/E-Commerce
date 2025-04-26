import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Supplier } from '../models/supplier.model';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  private apiUrl = 'http://localhost:8081/api/suppliers';

  constructor(private http: HttpClient) {}

  getAllSuppliers(): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  getSupplierById(id: number): Observable<Supplier> {
    return this.http.get<Supplier>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createSupplier(supplier: Supplier): Observable<Supplier> {
    return this.http.post<Supplier>(this.apiUrl, supplier).pipe(
      catchError(this.handleError)
    );
  }

  updateSupplier(id: number, supplier: Supplier): Observable<Supplier> {
    return this.http.put<Supplier>(`${this.apiUrl}/${id}`, supplier).pipe(
      catchError(this.handleError)
    );
  }

  partialUpdateSupplier(id: number, supplier: Partial<Supplier>): Observable<Supplier> {
    return this.http.patch<Supplier>(`${this.apiUrl}/${id}`, supplier).pipe(
      catchError(this.handleError)
    );
  }

  deleteSupplier(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client-side error: ${error.error.message}`;
    } else {
      errorMessage = `Server-side error: ${error.status} - ${error.message}`;
      if (error.error) {
        errorMessage += ` - ${error.error}`;
      }
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}