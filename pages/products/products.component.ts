import { Component, OnInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder } from '@angular/forms';
import { ProductTableComponent } from '../../components/products/product-list/product-table.component';
import { ProductFormComponent } from '../../components/products/product-form/product-form.component';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { LoaderComponent } from '../../components/loader/loader.component';
import { ProductsService } from '../../services/products.service';
import { CathegoriesService } from '../../services/cathegories.service';
import { IProduct } from '../../interfaces';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    LoaderComponent,
    PaginationComponent,
    ProductFormComponent,
    ProductTableComponent
  ],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  public productService: ProductsService = inject(ProductsService);
  public cathegoryService: CathegoriesService = inject(CathegoriesService);
  public fb: FormBuilder = inject(FormBuilder);

  public areActionsAvailable = true;
  public isEdit = false;
  public products: IProduct[] = [];
  public categoriesMap: Record<number, string> = {}; // mapa id -> nombre
  public productToCategoryId: Record<number, number> = {};
  public productToCategoryName: Record<number, string> = {};

  public form = this.fb.group({
    id: [0],
    nombre: [''],
    descripcion: [''],
    precio: [0],
    cantidadStock: [0],
    categoriaId: [0]
  });

  ngOnInit(): void {
    this.productService.getAll();
    this.cathegoryService.getAll();

    // reemplaza el effect que hacía subscribe por cada categoría por este enfoque
    effect(() => {
      const cats = this.cathegoryService.cathegories$();
      // limpiar
      this.productToCategoryId = {};
      this.productToCategoryName = {};
      if (!cats || cats.length === 0) return;

      const calls = cats
        .filter(cat => cat?.id != null)
        .map(cat =>
          this.productService
            .fetchProductsByCategoriaOnce(cat!.id!, 1, 1000)
            .pipe(map(products => ({ cat, products })))
        );

      if (calls.length === 0) return;

      // forkJoin completa cuando todas las llamadas respondan, evita múltiples suscripciones sueltas
      forkJoin(calls).subscribe(results => {
        const idMap: Record<number, number> = {};
        const nameMap: Record<number, string> = {};
        results.forEach(({ cat, products }) => {
          (products || []).forEach(p => {
            if (p?.id != null) {
              idMap[p.id] = cat!.id!;
              nameMap[p.id] = cat!.nombre ?? '';
            }
          });
        });
        this.productToCategoryId = idMap;
        this.productToCategoryName = nameMap;
      }, err => {
        console.warn('Error fetchProductsByCategoriaOnce (forkJoin)', err);
      });
    });
  }

  // getter para la plantilla
  get productsList(): IProduct[] {
    return this.productService?.products$?.() ?? [];
  }

  get totalPages(): number {
    return this.productService?.search?.totalPages ?? 0;
  }

  saveProduct(product?: IProduct) {
    if (!product) {
      product = {
        id: this.form.get('id')?.value,
        nombre: this.form.get('nombre')?.value,
        descripcion: this.form.get('descripcion')?.value,
        precio: this.form.get('precio')?.value,
        cantidadStock: this.form.get('cantidadStock')?.value,
        categoria: this.form.get('categoriaId')?.value ? { id: this.form.get('categoriaId')?.value } as any : undefined
      } as IProduct;
    }

    const categoriaIdRaw = this.form.get('categoriaId')?.value;

    // Validación robusta: aceptar sólo valores numéricos > 0 desde el formulario,
    // si no, usar el id que venga en el product.categoria (si existe)
    let categoriaId: number | undefined = undefined;

    if (categoriaIdRaw !== null && categoriaIdRaw !== undefined && String(categoriaIdRaw).trim() !== '') {
      const parsed = Number(categoriaIdRaw);
      if (Number.isFinite(parsed) && parsed > 0) {
        categoriaId = parsed;
      } else {
        console.warn('categoriaId del formulario no es un número válido:', categoriaIdRaw);
      }
    }

    if (categoriaId === undefined && product?.categoria?.id != null) {
      const parsedProdCat = Number(product!.categoria!.id);
      if (Number.isFinite(parsedProdCat) && parsedProdCat > 0) {
        categoriaId = parsedProdCat;
      }
    }

    if (this.isEdit) {
      this.productService.updateProduct(product);
      this.isEdit = false;
      this.form.reset({ id: 0, nombre: '', descripcion: '', precio: 0, cantidadStock: 0, categoriaId: 0 }); // <- reset a 0
    } else {
      if (!categoriaId) {
        console.error('CategoriaId requerido para crear un producto');
        return;
      }
      this.productService.saveProduct(product, categoriaId);
      this.form.reset({ id: 0, nombre: '', descripcion: '', precio: 0, cantidadStock: 0, categoriaId: 0 }); // <- reset a 0
    }
  }

  editProduct(product: IProduct) {
    if (!product) return;
    this.isEdit = true;
    this.form.patchValue({
      id: product.id ?? 0,
      nombre: product.nombre ?? '',
      descripcion: product.descripcion ?? '',
      precio: product.precio ?? 0,
      cantidadStock: product.cantidadStock ?? 0,
      categoriaId: product.categoria?.id ?? 0 // <- usar 0 en lugar de null
    });

    try { document.querySelector('app-product-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch {}
  }

  deleteProduct(product: IProduct) {
    if (!product?.id) return;
    if (!confirm(`Eliminar producto "${product.nombre}"?`)) return;
    this.productService.deleteProduct(product);
  }
}
