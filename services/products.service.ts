import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from './base-service';
import { IProduct } from '../interfaces';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductsService extends BaseService<IProduct> {
  protected override source: string = 'productos';
  private productsSignal = signal<IProduct[]>([]);


  get products$() {
    return this.productsSignal;
  }

  public search = {
    page: 1,
    size: 10,
    totalPages: 0,
    totalElements: 0
  };

  private applyMeta(meta: any) {
    if (!meta) return;
    this.search.totalPages = meta.totalPages ?? this.search.totalPages;
    this.search.totalElements = meta.totalElements ?? this.search.totalElements;
    this.search.page = meta.pageNumber ?? this.search.page;
    this.search.size = meta.pageSize ?? this.search.size;
  }

  getAll() {
    this.http.get(`${this.source}`, {
      params: {
        page: String(this.search.page),
        size: String(this.search.size)
      }
    }).subscribe({
      next: (response: any) => {
        const data = Array.isArray(response) ? response : (response.data ?? response);
        this.productsSignal.set(data || []);
        this.applyMeta(response?.meta ?? response?.data?.meta ?? null);
      },
      error: (err: any) => {
        console.error('ProductsService.getAll error', err);
      }
    });
  }

  getAllByCategoria(categoriaId: number | string) {
    this.http.get(`${this.source}/categorias/${categoriaId}`, {
      params: {
        page: String(this.search.page),
        size: String(this.search.size)
      }
    }).subscribe({
      next: (response: any) => {
        const data = Array.isArray(response) ? response : (response.data ?? response);
        this.productsSignal.set(data || []);
        // intento leer meta en distintas posiciones por seguridad
        this.applyMeta(response?.meta ?? response?.data?.meta ?? null);
      },
      error: (err: any) => {
        console.error('ProductsService.getAllByCategoria error', err);
      }
    });
  }

  saveProduct(product: IProduct, categoriaId: number | string) {
    this.http.post(`${this.source}/categorias/${categoriaId}`, product).subscribe({
      next: (response: any) => {
        this.getAll();
      },
      error: (err: any) => console.error('ProductsService.saveProduct error', err)
    });
  }

  updateProduct(product: IProduct) {
    const id = product.id;
    if (!id) return;
    this.http.patch(`${this.source}/${id}`, product).subscribe({
      next: (response: any) => {
        this.getAll();
      },
      error: (err: any) => console.error('ProductsService.updateProduct error', err)
    });
  }

  deleteProduct(product: IProduct) {
    const id = product.id;
    if (!id) return;
    this.del(id).subscribe({
      next: () => this.getAll(),
      error: (err: any) => console.error('ProductsService.deleteProduct error', err)
    });
  }

  // nuevo: obtener productos de una categoría (no toca el signal, devuelve Observable)
  fetchProductsByCategoriaOnce(categoriaId: number | string, page = 1, size = 1000): Observable<IProduct[]> {
    return this.http.get(`${this.source}/categorias/${categoriaId}`, {
      params: { page: String(page), size: String(size) }
    }).pipe(
      map((response: any) => Array.isArray(response) ? response : (response.data ?? response))
    );
  }
}