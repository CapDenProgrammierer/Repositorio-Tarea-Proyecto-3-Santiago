import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IProduct } from '../../../interfaces';

@Component({
  selector: 'app-product-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-table.component.html',
  styleUrls: ['./product-table.component.scss']
})
export class ProductTableComponent {
  @Input() products: IProduct[] = [];
  @Input() areActionsAvailable: boolean = false;
  @Input() categoriesMap: Record<number, string> = {}; // id -> nombre
  // nuevo: mapa productId -> categoryName (construido en la página)
  @Input() productCategoryNameMap: Record<number, string> = {};

  @Output() callEditMethod = new EventEmitter<IProduct>();
  @Output() callDeleteMethod = new EventEmitter<IProduct>();

  ngOnInit() {
    console.log('ProductTableComponent initialized, inputs:', this.products);
  }

  ngOnChanges() {
    console.log('Received products (ngOnChanges):', this.products);
  }

  trackById(index: number, item: IProduct) {
    return item?.id ?? index;
  }

  // helper para obtener nombre de categoría seguro
  categoryNameFor(product: IProduct): string {
    // prioridad:
    // 1) campo plano categoriaNombre (viene del DTO que añadiste en backend)
    // 2) product.categoria?.nombre (por si alguna ruta devuelve el objeto)
    // 3) mapa categoriesMap[categoriaId] (fallback si cargaste cathegories en frontend)
    if (product?.categoriaNombre) return product.categoriaNombre;
    const catObjName = product?.categoria?.nombre;
    if (catObjName) return catObjName;
    const cid = product?.categoriaId ?? product?.categoria?.id;
    if (cid != null && this.categoriesMap && this.categoriesMap[cid]) return this.categoriesMap[cid];
    return '-';
  }
}
