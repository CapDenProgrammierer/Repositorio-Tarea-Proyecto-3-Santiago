import { inject, Injectable, signal } from "@angular/core";
import { BaseService } from "./base-service";
import { ICathegory, IResponse, ISearch } from "../interfaces";
import { AlertService } from "./alert.service";

@Injectable({
    providedIn: 'root'
})
export class CathegoriesService extends BaseService<ICathegory> {
    protected override source: string = 'categorias';
    private cathegoriesSignal = signal<ICathegory[]>([]);

    get cathegories$() {
        return this.cathegoriesSignal;
    }
    public search: ISearch = {
        page: 1,
        size: 10
    }   
    public totalItems: any = [];
    private alertService: AlertService = inject(AlertService);

    getAll() {
      this.findAll().subscribe({
        next: (response: any) => {
          const data = Array.isArray(response) ? response : (response.data ?? response);
          this.cathegoriesSignal.set(data || []);
        },
        error: (err: any) => {
          console.error('CathegoriesService.getAll error', err);
        }
      });
    }

  saveCathegory(cathegory: ICathegory) {
    this.add(cathegory).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert(
          'success',
          response?.message || 'Categoría agregada correctamente',
          'center',
          'top',
          ['success-snackbar']
        );
        this.getAll();
      },
      error: (err: any) => {
        this.alertService.displayAlert(
          'error',
          'Error al agregar la categoría',
          'center',
          'top',
          ['error-snackbar']
        );
        console.error('error', err);
      }
    });
  }

  updateCathegory(cathegory: ICathegory) {
    this.edit(cathegory.id, cathegory).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert(
          'success',
          response?.message || 'Categoría actualizada correctamente',
          'center',
          'top',
          ['success-snackbar']
        );
        this.getAll();
      },
      error: (err: any) => {
        this.alertService.displayAlert(
          'error',
          'Error al actualizar la categoría',
          'center',
          'top',
          ['error-snackbar']
        );
        console.error('error', err);
      }
    });
  }

  deleteCathegory(cathegory: ICathegory) {
    this.del(cathegory.id).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert(
          'success',
          response?.message || 'Categoría eliminada correctamente',
          'center',
          'top',
          ['success-snackbar']
        );
        this.getAll();
      },
      error: (err: any) => {
        this.alertService.displayAlert(
          'error',
          'Error al eliminar la categoría',
          'center',
          'top',
          ['error-snackbar']
        );
        console.error('error', err);
      }
    });
  }
}