import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Supplier } from '../models/supplier.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  private apiUrl = `${environment.apiUrl}/suppliers`;

  constructor(private http: HttpClient) {}

  getAllSuppliers(page: number = 0, size: number = 10): Observable<{ content: Supplier[], totalElements: number, totalPages: number }> {
    return this.http.get<{ content: Supplier[], totalElements: number, totalPages: number }>(`${this.apiUrl}?page=${page}&size=${size}`).pipe(
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
    let errorMessage = 'An unexpected error occurred. Please try again later.';

    if (error.error && typeof error.error === 'object' && error.error.message) {
      errorMessage = error.error.message; 
    } else if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else if (error.status === 0) {
      errorMessage = 'Unable to connect to the server. Please check your network connection.';
    } else if (error.status === 404) {
      errorMessage = 'Resource not found. The server might be down or the supplier does not exist.';
    } else if (error.status >= 500) {
      errorMessage = 'A server error occurred. Please try again later.';
    }

    console.error('Error occurred:', error); 
    return throwError(() => new Error(errorMessage));
  }
}