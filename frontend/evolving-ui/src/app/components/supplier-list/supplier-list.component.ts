import { Component, OnInit } from '@angular/core';
import { SupplierService } from '@app/services/supplier.service';
import { LlmService } from '@app/services/llm.service';
import { Supplier } from '@app/models/supplier.model';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '@environments/environment';
import { catchError, throwError } from 'rxjs';

@Component({
  selector: 'app-supplier-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './supplier-list.component.html',
  styleUrls: ['./supplier-list.component.css']
})
export class SupplierListComponent implements OnInit {
  suppliers: Supplier[] = [];
  filteredSuppliers: Supplier[] = [];
  newSupplierForm: FormGroup;
  editSupplierForm: FormGroup | null = null;
  editSupplier: Supplier | null = null;
  errorMessage: string = '';
  llmPrompt: string = '';
  llmResponse: string = '';
  isLoading: boolean = false;

  // Filter properties
  filterItem: string = '';
  filterDeliveryTime: number | null = null;
  filterRejectionRate: number | null = null;

  // Sort properties
  sortColumn: keyof Supplier | '' = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Pagination properties
  currentPage: number = 0;
  pageSize: number = 10;
  totalElements: number = 0;
  totalPages: number = 0;

  // Voice input properties
  isRecording: boolean = false;
  stream: MediaStream | null = null;
  mediaRecorder: MediaRecorder | null = null;
  audioChunks: Blob[] = [];
  transcribedText: string = '';
  hasTranscribed: boolean = false;
  recognitionTimeout: any;

  constructor(
    private supplierService: SupplierService,
    private llmService: LlmService,
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.newSupplierForm = this.fb.group({
      item: ['', [Validators.required, Validators.maxLength(50)]],
      deliveryTime: [0, [Validators.required, Validators.min(1)]],
      rejectionRate: [0, [Validators.required, Validators.min(0), Validators.max(1)]]
    });
  }

  ngOnInit(): void {
    this.loadSuppliers();
  }

  async toggleVoiceInput(): Promise<void> {
    if (this.isRecording) {
      this.stopRecording();
    } else {
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.mediaRecorder = new MediaRecorder(this.stream);
        this.audioChunks = [];

        this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
          this.audioChunks.push(event.data);
        };

        this.mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
          await this.transcribeAudio(audioBlob);
          this.stream?.getTracks().forEach(track => track.stop());
          this.stream = null;
          this.mediaRecorder = null;
          this.audioChunks = [];
          this.isRecording = false;
          clearTimeout(this.recognitionTimeout);
        };

        this.mediaRecorder.start();
        this.isRecording = true;
        this.errorMessage = '';
        this.transcribedText = '';
        this.hasTranscribed = false;

        this.recognitionTimeout = setTimeout(() => {
          if (this.isRecording) {
            console.log('Recording timeout reached');
            this.stopRecording();
            this.errorMessage = 'No speech recorded within 10 seconds. Please try again or use manual input.';
          }
        }, 10000);
      } catch (err: any) {
        this.isRecording = false;
        this.errorMessage = `Failed to access microphone: ${err.message}`;
      }
    }
  }

  stopRecording(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
    }
  }

  async transcribeAudio(audioBlob: Blob): Promise<void> {
    try {
      // Step 1: Upload the audio file to AssemblyAI
      const uploadUrl = 'https://api.assemblyai.com/v2/upload';
      const headers = new HttpHeaders({
        'authorization': environment.assemblyAIKey,
        'content-type': 'application/octet-stream'
      });

      const uploadResponse: any = await this.http.post(
        uploadUrl,
        audioBlob,
        { headers, observe: 'response' }
      ).pipe(
        catchError(err => {
          this.errorMessage = 'Failed to upload audio due to network issues. Please check your connection or use manual input.';
          return throwError(() => err);
        })
      ).toPromise();

      const audioUrl = uploadResponse.body.upload_url;

      // Step 2: Request transcription
      const transcribeUrl = 'https://api.assemblyai.com/v2/transcript';
      const transcribeHeaders = new HttpHeaders({
        'authorization': environment.assemblyAIKey,
        'content-type': 'application/json'
      });

      const transcribeResponse: any = await this.http.post(
        transcribeUrl,
        { audio_url: audioUrl },
        { headers: transcribeHeaders, observe: 'response' }
      ).pipe(
        catchError(err => {
          this.errorMessage = 'Failed to request transcription due to network issues. Please check your connection or use manual input.';
          return throwError(() => err);
        })
      ).toPromise();

      const transcriptId = transcribeResponse.body.id;

      // Step 3: Poll for transcription result
      const pollUrl = `https://api.assemblyai.com/v2/transcript/${transcriptId}`;
      let status = 'processing';
      let attempts = 0;
      const maxAttempts = 30; // 30 attempts * 2 seconds = 60 seconds max wait

      while (status === 'processing' || status === 'queued') {
        if (attempts >= maxAttempts) {
          this.errorMessage = 'Transcription timed out. Please try again or use manual input.';
          return;
        }

        const pollResponse: any = await this.http.get(
          pollUrl,
          { headers: transcribeHeaders, observe: 'response' }
        ).pipe(
          catchError(err => {
            this.errorMessage = 'Failed to retrieve transcription due to network issues. Please check your connection or use manual input.';
            return throwError(() => err);
          })
        ).toPromise();

        status = pollResponse.body.status;
        if (status === 'completed') {
          this.transcribedText = pollResponse.body.text || '';
          this.hasTranscribed = true;
          console.log('AssemblyAI transcription:', this.transcribedText);

          if (!this.transcribedText) {
            this.errorMessage = 'No speech detected in the recording. Please try again or use manual input.';
          }
        } else if (status === 'error') {
          this.errorMessage = 'Transcription failed on the server. Please try again or use manual input.';
          return;
        }

        attempts++;
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before polling again
      }
    } catch (err: any) {
      console.error('Transcription error:', err);
      if (!this.errorMessage) {
        this.errorMessage = 'Failed to transcribe audio: ' + err.message + '. Please use manual input instead.';
      }
    }
  }

  confirmTranscription(): void {
    if (!this.transcribedText) {
      this.errorMessage = 'No transcription available. Please record a prompt or enter one manually.';
      return;
    }
    console.log('Confirming transcription:', this.transcribedText);
    this.llmPrompt = this.transcribedText;
    this.transcribedText = '';
    this.hasTranscribed = false;
    this.getLlmSuggestion();
  }

  reRecord(): void {
    console.log('Re-recording');
    this.transcribedText = '';
    this.hasTranscribed = false;
    this.toggleVoiceInput();
  }

  loadSuppliers(): void {
    this.supplierService.getAllSuppliers(this.currentPage, this.pageSize).subscribe({
      next: (response: { content: Supplier[], totalElements: number, totalPages: number }) => {
        this.suppliers = response.content;
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
        this.applyFilters();
        this.errorMessage = '';
      },
      error: (err: any) => {
        this.errorMessage = 'Failed to load suppliers: ' + err.message;
      }
    });
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadSuppliers();
    }
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  createSupplier(): void {
    if (this.newSupplierForm.invalid) {
      this.errorMessage = 'Please fill in all required fields correctly: ' + this.getFormErrors(this.newSupplierForm);
      return;
    }
    const newSupplier: Supplier = this.newSupplierForm.value;
    this.supplierService.createSupplier(newSupplier).subscribe({
      next: (supplier: Supplier) => {
        this.suppliers.push(supplier);
        this.newSupplierForm.reset({ item: '', deliveryTime: 0, rejectionRate: 0 });
        this.newSupplierForm.markAsPristine();
        this.newSupplierForm.markAsUntouched();
        this.applyFilters();
        this.errorMessage = '';
        this.loadSuppliers();
      },
      error: (err: any) => {
        this.errorMessage = `Failed to create supplier: ${err.message}`;
      }
    });
  }

  startEdit(supplier: Supplier): void {
    this.editSupplier = { ...supplier };
    this.editSupplierForm = this.fb.group({
      item: [supplier.item, [Validators.required, Validators.maxLength(50)]],
      deliveryTime: [supplier.deliveryTime, [Validators.required, Validators.min(1)]],
      rejectionRate: [supplier.rejectionRate, [Validators.required, Validators.min(0), Validators.max(1)]]
    });
  }

  updateSupplier(): void {
    if (!this.editSupplier || !this.editSupplier.id || !this.editSupplierForm?.valid) {
      this.errorMessage = 'No supplier selected or form is invalid';
      return;
    }

    const editSupplierNonNull = this.editSupplier as Supplier;
    const supplierId = editSupplierNonNull.id!;
    const originalSupplier = this.suppliers.find(s => s.id === supplierId);
    if (!originalSupplier) {
      this.errorMessage = 'Original supplier not found';
      return;
    }

    const partialUpdate: Partial<Supplier> = {};
    const updatedValues = this.editSupplierForm.value;
    if (updatedValues.item !== originalSupplier.item) {
      partialUpdate.item = updatedValues.item;
    }
    if (updatedValues.deliveryTime !== originalSupplier.deliveryTime) {
      partialUpdate.deliveryTime = updatedValues.deliveryTime;
    }
    if (updatedValues.rejectionRate !== originalSupplier.rejectionRate) {
      partialUpdate.rejectionRate = updatedValues.rejectionRate;
    }

    if (Object.keys(partialUpdate).length > 0) {
      this.supplierService.partialUpdateSupplier(supplierId, partialUpdate).subscribe({
        next: (updatedSupplier: Supplier) => {
          const index = this.suppliers.findIndex(s => s.id === updatedSupplier.id);
          if (index !== -1) {
            this.suppliers[index] = updatedSupplier;
          }
          this.editSupplier = null;
          if (this.editSupplierForm) {
            this.editSupplierForm.reset();
            this.editSupplierForm.markAsPristine();
            this.editSupplierForm.markAsUntouched();
          }
          this.editSupplierForm = null;
          this.applyFilters();
          this.errorMessage = '';
        },
        error: (err: any) => {
          this.errorMessage = 'Failed to update supplier: ' + err.message;
        }
      });
    } else {
      this.editSupplier = null;
      if (this.editSupplierForm) {
        this.editSupplierForm.reset();
        this.editSupplierForm.markAsPristine();
        this.editSupplierForm.markAsUntouched();
      }
      this.editSupplierForm = null;
      this.applyFilters();
      this.errorMessage = '';
    }
  }

  deleteSupplier(id: number): void {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      this.supplierService.deleteSupplier(id).subscribe({
        next: () => {
          this.suppliers = this.suppliers.filter(s => s.id !== id);
          this.applyFilters();
          this.errorMessage = '';
          this.loadSuppliers();
        },
        error: (err: any) => {
          this.errorMessage = 'Failed to delete supplier: ' + err.message;
        }
      });
    }
  }

  cancelEdit(): void {
    this.editSupplier = null;
    if (this.editSupplierForm) {
      this.editSupplierForm.reset();
      this.editSupplierForm.markAsPristine();
      this.editSupplierForm.markAsUntouched();
    }
    this.editSupplierForm = null;
    this.errorMessage = '';
  }

  getLlmSuggestion(): void {
    if (!this.llmPrompt) {
      this.errorMessage = 'Please enter a prompt for the suggestion.';
      return;
    }

    const promptPattern = /^[A-Za-z0-9\s,.!?]+$/;
    if (!promptPattern.test(this.llmPrompt)) {
      this.errorMessage = 'Prompt can only contain letters, numbers, spaces, and basic punctuation (,.!?)';
      return;
    }

    if (this.llmPrompt.length > 200) {
      this.errorMessage = 'Prompt cannot exceed 200 characters.';
      return;
    }

    if (this.suppliers.length === 0) {
      this.llmResponse = 'No suppliers available to suggest.';
      return;
    }

    const filterCriteria: string[] = [];
    if (this.filterItem) {
      filterCriteria.push(`item contains "${this.filterItem}"`);
    }
    if (this.filterDeliveryTime !== null && this.filterDeliveryTime !== undefined) {
      filterCriteria.push(`delivery time <= ${this.filterDeliveryTime} days`);
    }
    if (this.filterRejectionRate !== null && this.filterRejectionRate !== undefined) {
      filterCriteria.push(`rejection rate <= ${this.filterRejectionRate}`);
    }
    const filterText = filterCriteria.length > 0
      ? `Filtered by: ${filterCriteria.join(', ')}\n`
      : '';

    const supplierData = this.filteredSuppliers.map(s => 
      `ID: ${s.id}, item: ${s.item}, Delivery Time: ${s.deliveryTime} days, Rejection Rate: ${s.rejectionRate}`
    ).join('\n');
    
    const fullPrompt = `Supplier data:\n${supplierData}\n\n${filterText}${this.llmPrompt}\nDon't give reasoning, just give me the suggestion`;
    console.log('LLM Prompt:', this.llmPrompt);
    console.log('Prompt sent to LLM:', fullPrompt);

    this.isLoading = true;
    this.llmService.getSuggestion(fullPrompt).subscribe({
      next: (response: any) => {
        const suggestion = response.choices?.[0]?.message?.content || response.content || 'No suggestion available.';
        this.llmResponse = suggestion;
        this.errorMessage = '';
        this.isLoading = false;
      },
      error: (err: any) => {
        this.errorMessage = `Failed to get suggestion: ${err.message}`;
        this.llmResponse = '';
        this.isLoading = false;
      }
    });
  }

  sort(column: keyof Supplier): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.filteredSuppliers.sort((a, b) => {
      const valueA = a[column];
      const valueB = b[column];

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return this.sortDirection === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      } else {
        return this.sortDirection === 'asc'
          ? (valueA as number) - (valueB as number)
          : (valueB as number) - (valueA as number);
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.suppliers];

    if (this.filterItem) {
      const filterValue = this.filterItem.toLowerCase().trim();
      filtered = filtered.filter(supplier =>
        supplier.item.toLowerCase().includes(filterValue)
      );
    }

    if (this.filterDeliveryTime !== null && this.filterDeliveryTime !== undefined) {
      filtered = filtered.filter(supplier =>
        supplier.deliveryTime <= this.filterDeliveryTime!
      );
    }

    if (this.filterRejectionRate !== null && this.filterRejectionRate !== undefined) {
      filtered = filtered.filter(supplier =>
        supplier.rejectionRate <= this.filterRejectionRate!
      );
    }

    this.filteredSuppliers = filtered;
  }

  private getFormErrors(form: FormGroup): string {
    const messages: string[] = [];
    Object.keys(form.controls).forEach(field => {
      const control = form.get(field);
      if (control?.invalid) {
        const errors = control.errors;
        if (field === 'item') {
          if (errors?.['required']) {
            messages.push('Item is required');
          } else if (errors?.['maxlength']) {
            messages.push('Item must be less than 50 characters');
          }
        } else if (field === 'deliveryTime') {
          if (errors?.['required']) {
            messages.push('Delivery Time is required');
          } else if (errors?.['min']) {
            messages.push('Delivery Time must be a positive number');
          }
        } else if (field === 'rejectionRate') {
          if (errors?.['required']) {
            messages.push('Rejection Rate is required');
          } else if (errors?.['min']) {
            messages.push('Rejection Rate must be non-negative');
          } else if (errors?.['max']) {
            messages.push('Rejection Rate must be at most 1');
          }
        }
      }
    });
    return messages.join(', ');
  }
}