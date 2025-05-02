import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class LlmService {
  private apiUrl = environment.groqApiUrl;
  private apiKey = environment.groqApiKey; 

  constructor(private http: HttpClient) {}

  getSuggestion(prompt: string): Observable<any> {
    console.log('API Key:', this.apiKey); 

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    });

    const body = {
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 150,
      temperature: 0.5
    };

    console.log('Request headers:', headers.get('Authorization')); 
    console.log('Request body:', body); 

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