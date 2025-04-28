import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LlmService {
  private apiUrl = ''; // Replace with the actual API URL
  private apiKey = ''; // Replace with api key

  constructor(private http: HttpClient) {}

  getSuggestion(prompt: string): Observable<any> {
    console.log('API Key:', this.apiKey); // Debug: Log the API key

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    });

    const body = {};     // Replace with the actual body structure expected by the API

    console.log('Request headers:', headers.get('Authorization')); // Debug: Log the Authorization header
    console.log('Request body:', body); // Log the request body

    return this.http.post(this.apiUrl, body, { headers }).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error('LLM API error:', {
          status: err.status,
          statusText: err.statusText,
          message: err.message,
          error: err.error
        });
        return throwError(() => new Error(`Failed to get suggestion from LLM: ${err.status} - ${err.message}`));
      })
    );
  }
}