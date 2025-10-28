import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IProduct } from '../../../interfaces';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit {
  @Input() form?: FormGroup;
  @Input() isEdit: boolean = false;
  @Output() callSaveMethod = new EventEmitter<IProduct>();

  private fb = inject(FormBuilder);

  ngOnInit(): void {
    if (!this.form) {
      this.form = this.fb.group({
        id: [0],
        nombre: ['', Validators.required],
        descripcion: [''],
        precio: [0, Validators.required],
        cantidadStock: [0],
        categoriaId: [0, [Validators.required, Validators.min(1)]] // <- inicial 0 + validación min(1)
      });
    } else {
      if (!this.form.get('id')) this.form.addControl('id', this.fb.control(0));
      if (!this.form.get('nombre')) this.form.addControl('nombre', this.fb.control('', Validators.required));
      if (!this.form.get('descripcion')) this.form.addControl('descripcion', this.fb.control(''));
      if (!this.form.get('precio')) this.form.addControl('precio', this.fb.control(0, Validators.required));
      if (!this.form.get('cantidadStock')) this.form.addControl('cantidadStock', this.fb.control(0));
      if (!this.form.get('categoriaId')) this.form.addControl('categoriaId', this.fb.control(0, [Validators.required, Validators.min(1)]));
    }
  }

  onSubmit() {
    if (!this.form) return;
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach(c => c.markAsTouched());
      return;
    }

    const payload: IProduct = {
      id: this.form.get('id')?.value,
      nombre: this.form.get('nombre')?.value,
      descripcion: this.form.get('descripcion')?.value,
      precio: this.form.get('precio')?.value,
      cantidadStock: this.form.get('cantidadStock')?.value,
      categoria: this.form.get('categoriaId')?.value ? { id: this.form.get('categoriaId')?.value } as any : undefined
    };

    this.callSaveMethod.emit(payload);
    this.form.patchValue({ id: 0, nombre: '', descripcion: '', precio: 0, cantidadStock: 0, categoriaId: null });
    this.form.markAsPristine();
  }
}
