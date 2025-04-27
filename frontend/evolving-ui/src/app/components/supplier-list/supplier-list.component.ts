import { Component, OnInit } from '@angular/core';
import { SupplierService } from '../../services/supplier.service';
import { Supplier } from '../../models/supplier.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-supplier-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './supplier-list.component.html',
  styleUrls: ['./supplier-list.component.css']
})
export class SupplierListComponent implements OnInit {
  suppliers: Supplier[] = [];
  newSupplier: Supplier = { item: '', deliveryTime: 0, rejectionRate: 0 };
  editSupplier: Supplier | null = null;
  errorMessage: string = '';

  constructor(private supplierService: SupplierService) {}

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
    this.supplierService.createSupplier(this.newSupplier).subscribe({
      next: (supplier: Supplier) => {
        this.suppliers.push(supplier);
        this.newSupplier = { item: '', deliveryTime: 0, rejectionRate: 0 };
        this.errorMessage = '';
      },
      error: (err: any) => {
        console.error('Create supplier error:', err); // Add for debugging
        this.errorMessage = `Failed to create supplier: ${err.status} - ${err.statusText} - ${err.message || err.error || 'Unknown Error'}`;
      }
    });
  }

  startEdit(supplier: Supplier): void {
    this.editSupplier = { ...supplier };
  }

  updateSupplier(): void {
    if (!this.editSupplier || this.editSupplier.id == null) {
      this.errorMessage = 'No supplier selected for update';
      return;
    }

    const editSupplierNonNull = this.editSupplier;
    const originalSupplier = this.suppliers.find(s => s.id === editSupplierNonNull.id);
    if (!originalSupplier) {
      this.errorMessage = 'Original supplier not found';
      return;
    }

    const partialUpdate: Partial<Supplier> = {};
    if (editSupplierNonNull.item !== originalSupplier.item) {
      partialUpdate.item = editSupplierNonNull.item;
    }
    if (editSupplierNonNull.deliveryTime !== originalSupplier.deliveryTime) {
      partialUpdate.deliveryTime = editSupplierNonNull.deliveryTime;
    }
    if (editSupplierNonNull.rejectionRate !== originalSupplier.rejectionRate) {
      partialUpdate.rejectionRate = editSupplierNonNull.rejectionRate;
    }

    if (Object.keys(partialUpdate).length > 0) {
      this.supplierService.partialUpdateSupplier(editSupplierNonNull.id!, partialUpdate).subscribe({
        next: (updatedSupplier: Supplier) => {
          const index = this.suppliers.findIndex(s => s.id === updatedSupplier.id);
          if (index !== -1) {
            this.suppliers[index] = updatedSupplier;
          }
          this.editSupplier = null;
          this.errorMessage = '';
        },
        error: (err: any) => {
          this.errorMessage = 'Failed to update supplier: ' + err.message;
        }
      });
    } else {
      this.editSupplier = null;
      this.errorMessage = '';
    }
  }

  deleteSupplier(id: number): void {
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

  cancelEdit(): void {
    this.editSupplier = null;
    this.errorMessage = '';
  }
}
