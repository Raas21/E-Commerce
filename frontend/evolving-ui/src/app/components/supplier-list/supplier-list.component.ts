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
  newSupplierForm: FormGroup;
  editSupplierForm: FormGroup | null = null;
  editSupplier: Supplier | null = null;
  errorMessage: string = '';
  llmPrompt: string = '';
  llmResponse: string = '';

  constructor(
    private supplierService: SupplierService,
    private llmService: LlmService,
    private fb: FormBuilder
  ) {
    this.newSupplierForm = this.fb.group({
      item: ['', Validators.required],
      deliveryTime: [0, [Validators.required, Validators.min(0)]],
      rejectionRate: [0, [Validators.required, Validators.min(0), Validators.max(1)]]
    });
  }

  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers(): void {
    this.supplierService.getAllSuppliers().subscribe({
      next: (data: Supplier[]) => {
        this.suppliers = data;
      },
      error: (err: any) => {
        this.errorMessage = 'Failed to load suppliers: ' + err.message;
      }
    });
  }

  createSupplier(): void {
    if (this.newSupplierForm.invalid) {
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }
    const newSupplier: Supplier = this.newSupplierForm.value;
    this.supplierService.createSupplier(newSupplier).subscribe({
      next: (supplier: Supplier) => {
        this.suppliers.push(supplier);
        this.newSupplierForm.reset({ item: '', deliveryTime: 0, rejectionRate: 0 });
        this.errorMessage = '';
      },
      error: (err: any) => {
        this.errorMessage = `Failed to create supplier: ${err.status} - ${err.statusText} - ${err.message || err.error || 'Unknown Error'}`;
      }
    });
  }

  startEdit(supplier: Supplier): void {
    this.editSupplier = { ...supplier };
    this.editSupplierForm = this.fb.group({
      item: [supplier.item, Validators.required],
      deliveryTime: [supplier.deliveryTime, [Validators.required, Validators.min(0)]],
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
          this.errorMessage = '';
        },
        error: (err: any) => {
          this.errorMessage = 'Failed to update supplier: ' + err.message;
        }
      });
    } else {
      this.editSupplier = null;
      this.editSupplierForm = null;
      this.errorMessage = '';
    }
  }

  deleteSupplier(id: number): void {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      this.supplierService.deleteSupplier(id).subscribe({
        next: () => {
          this.suppliers = this.suppliers.filter(s => s.id !== id);
          this.errorMessage = '';
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

  isLoading: boolean = false;

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

    const supplierData = this.suppliers.map(s => `ID: ${s.id}, item: ${s.item}, Delivery Time: ${s.deliveryTime} days, Rejection Rate: ${s.rejectionRate}`).join('\n');
    const fullPrompt = `Supplier data:\n${supplierData}\n\n${this.llmPrompt} dont give reasoning, just give me the suggestion`;
    console.log('LLM Prompt:', this.llmPrompt); // Debug: Log the LLM prompt
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
}