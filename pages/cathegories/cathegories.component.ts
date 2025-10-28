import { Component, OnInit, inject, effect } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { CathegoriesService } from '../../services/cathegories.service';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from '../../components/loader/loader.component';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { CathegoriesFormComponent } from "../../components/cathegories/cathegories-form/cathegories-form.component";
import { ICathegory } from '../../interfaces';
import { CathegoriesTableComponent } from "../../components/cathegories/cathegories-table/cathegories-table.component";

@Component({
  selector: 'app-cathegories',
  standalone: true,
  imports: [
    CommonModule,
    LoaderComponent,
    PaginationComponent,
    CathegoriesFormComponent,
    CathegoriesTableComponent
  ],
  templateUrl: './cathegories.component.html',
  styleUrls: ['./cathegories.component.scss'] // <- corregido
})
export class CathegoriesComponent implements OnInit {

  public cathegoryService: CathegoriesService = inject(CathegoriesService);
  public fb: FormBuilder = inject(FormBuilder);
  public authService: AuthService = inject(AuthService);
  public route: ActivatedRoute = inject(ActivatedRoute);

  public areActionsAvailable: boolean = false;
  public isEdit: boolean = false;
  public cathegories: ICathegory[] = [];

  public form = this.fb.group({
    id: [0],
    nombre: [''],
    descripcion: ['']
  });

  constructor() {
    effect(() => {
      this.cathegories = this.cathegoryService.cathegories$();
      console.log('Categorías actualizadas:', this.cathegories);
    });
  }

  ngOnInit() {
    this.cathegoryService.getAll();
    console.log('Cathegories (signal):', this.cathegoryService.cathegories$?.());
    this.route.data.subscribe(data => {
      this.areActionsAvailable = this.authService.areActionsAvailable(
        data['authorities'] ? data['authorities'] : []
      );
      console.log('🔐 areActionsAvailable:', this.areActionsAvailable);
    });
  }

  // Cuando se recibe el evento desde el formulario (submit)
  saveCathegory(cathegory: ICathegory) {
    if (this.isEdit) {
      // Modo edición: actualizar
      this.cathegoryService.updateCathegory(cathegory);
      // resetear estado del formulario y modo edición
      this.isEdit = false;
      this.form.reset({ id: 0, nombre: '', descripcion: '' });
    } else {
      // Modo creación: guardar nueva categoría
      this.cathegoryService.saveCathegory(cathegory);
      this.form.reset({ id: 0, nombre: '', descripcion: '' });
    }
  }

  // Método que se llama al hacer click en "Edit" en la tabla:
  // parchea el form con los valores de la categoría seleccionada y activa isEdit
  selectCathegoryToEdit(cathegory: ICathegory) {
    if (!cathegory) return;
    this.isEdit = true;
    this.form.patchValue({
      id: cathegory.id ?? 0,
      nombre: cathegory.nombre ?? '',
      descripcion: cathegory.descripcion ?? ''
    });

    // opcional: desplazar la vista hacia el formulario
    try {
      const el = document.querySelector('app-cathegory-form');
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch {}
  }

  updateCathegory(cathegory: ICathegory) {
    // mantener para compatibilidad si se usaba desde otro lugar
    this.cathegoryService.updateCathegory(cathegory);
  }

  deleteCathegory(cathegory: ICathegory) {
    this.cathegoryService.deleteCathegory(cathegory);
  }
}
