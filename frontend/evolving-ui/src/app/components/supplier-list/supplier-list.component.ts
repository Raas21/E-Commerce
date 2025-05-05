import { Component, OnInit } from '@angular/core';
import { SupplierService } from '../../services/supplier.service';
import { LlmService } from '../../services/llm.service';
import { Supplier } from '../../models/supplier.model';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';

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
  speechRecognition: any; // SpeechRecognition instance
  transcribedText: string = ''; // Live transcribed text
  hasTranscribed: boolean = false; // Whether transcription has completed

  constructor(
    private supplierService: SupplierService,
    private llmService: LlmService,
    private fb: FormBuilder
  ) {
    this.newSupplierForm = this.fb.group({
      item: ['', [Validators.required, Validators.maxLength(50)]],
      deliveryTime: [0, [Validators.required, Validators.min(1)]],
      rejectionRate: [0, [Validators.required, Validators.min(0), Validators.max(1)]]
    });

    this.initializeSpeechRecognition();
  }

  ngOnInit(): void {
    this.loadSuppliers();
  }

  initializeSpeechRecognition(): void {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      this.errorMessage = 'Speech recognition is not supported in this browser. Please use a modern browser like Chrome or Edge.';
      return;
    }

    this.speechRecognition = new SpeechRecognition();
    this.speechRecognition.continuous = false;
    this.speechRecognition.interimResults = true; // Enable live transcription
    this.speechRecognition.lang = 'en-US';

    this.speechRecognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      this.transcribedText = finalTranscript + interimTranscript;
      this.hasTranscribed = !!finalTranscript; // Set to true when final transcript is available
    };

    this.speechRecognition.onerror = (event: any) => {
      this.isRecording = false;
      this.hasTranscribed = false;
      if (event.error === 'no-speech') {
        this.errorMessage = 'No speech detected. Please try again.';
      } else if (event.error === 'not-allowed') {
        this.errorMessage = 'Microphone access denied. Please allow microphone access to use voice input.';
      } else {
        this.errorMessage = `Speech recognition error: ${event.error}`;
      }
    };

    this.speechRecognition.onend = () => {
      this.isRecording = false;
    };
  }

  toggleVoiceInput(): void {
    if (!this.speechRecognition) {
      this.errorMessage = 'Speech recognition is not supported in this browser.';
      return;
    }

    if (this.isRecording) {
      this.speechRecognition.stop();
      this.isRecording = false;
    } else {
      this.isRecording = true;
      this.errorMessage = '';
      this.transcribedText = '';
      this.hasTranscribed = false;
      this.speechRecognition.start();
    }
  }

  confirmTranscription(): void {
    if (!this.transcribedText) {
      this.errorMessage = 'No transcription available. Please record a prompt.';
      return;
    }
    this.llmPrompt = this.transcribedText;
    this.transcribedText = '';
    this.hasTranscribed = false;
    this.getLlmSuggestion();
  }

  reRecord(): void {
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