import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ICathegory } from '../../../interfaces';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-cathegory-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './cathegories-form.component.html',
  styleUrls: ['./cathegories-form.component.scss']
})
export class CathegoriesFormComponent implements OnInit {
  @Input() form?: FormGroup;
  @Input() isEdit: boolean = false;
  @Output() callSaveMethod = new EventEmitter<ICathegory>();

  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  public isPrivileged: boolean = false;

  ngOnInit(): void {
    if (!this.form) {
      this.form = this.fb.group({
        id: [0],
        nombre: ['', Validators.required],
        descripcion: ['']
      });
    } else {
      if (!this.form.get('nombre')) {
        this.form.addControl('nombre', this.fb.control('', Validators.required));
      }
      if (!this.form.get('descripcion')) {
        this.form.addControl('descripcion', this.fb.control(''));
      }
      if (!this.form.get('id')) {
        this.form.addControl('id', this.fb.control(0));
      }
    }

    // role check: permitir ADMIN o SUPER_ADMIN
    try {
      this.isPrivileged = !!(this.auth.isSuperAdmin?.() || this.auth.hasRole?.('ADMIN'));
    } catch {
      this.isPrivileged = false;
    }
    if (!this.isPrivileged && this.form) {
      // deshabilita el formulario para usuarios sin permisos
      this.form.disable();
    }
  }

  onSubmit() {
    if (!this.form) return;
    if (!this.isPrivileged) return; // evitar envíos por usuarios no autorizados
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach(c => c.markAsTouched());
      return;
    }

    const payload: ICathegory = {
      id: this.form.get('id')?.value,
      nombre: this.form.get('nombre')?.value,
      descripcion: this.form.get('descripcion')?.value
    };

    this.callSaveMethod.emit(payload);
    this.form.patchValue({ id: 0, nombre: '', descripcion: '' });
    this.form.markAsPristine();
  }
}
