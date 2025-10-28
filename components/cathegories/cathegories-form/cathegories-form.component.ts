import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ICathegory } from '../../../interfaces';

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

  ngOnInit(): void {
    // Si el padre no pasa un form, crear uno local con los mismos nombres de control
    if (!this.form) {
      this.form = this.fb.group({
        id: [0],
        nombre: ['', Validators.required],
        descripcion: ['']
      });
    } else {
      // garantizar que los controles existan en el form que viene del padre
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
  }

  onSubmit() {
    if (!this.form) return;
    if (this.form.invalid) {
      // marcar los controles como tocados para mostrar errores
      Object.values(this.form.controls).forEach(c => c.markAsTouched());
      return;
    }

    const payload: ICathegory = {
      id: this.form.get('id')?.value,
      nombre: this.form.get('nombre')?.value,
      descripcion: this.form.get('descripcion')?.value
    };

    this.callSaveMethod.emit(payload);
    // opcional: reset parcial del formulario (conservar id=0)
    this.form.patchValue({ id: 0, nombre: '', descripcion: '' });
    this.form.markAsPristine();
  }
}
