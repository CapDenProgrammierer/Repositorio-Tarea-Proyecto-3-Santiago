import { Component, EventEmitter, Input, Output, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IProduct } from '../../../interfaces';
import { AuthService } from '../../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-product-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-table.component.html',
  styleUrls: ['./product-table.component.scss']
})
export class ProductTableComponent implements OnDestroy {
  @Input() products: IProduct[] = [];
  @Input() areActionsAvailable: boolean = false;
  @Input() categoriesMap: Record<number, string> = {};
  @Input() productCategoryNameMap: Record<number, string> = {};

  @Output() callEditMethod = new EventEmitter<IProduct>();
  @Output() callDeleteMethod = new EventEmitter<IProduct>();

  private auth = inject(AuthService) as any;
  private sub: Subscription | null = null;
  public isSuperAdmin = false;

  ngOnInit() {
    this.checkRole();
  }

  ngOnChanges() {
    console.log('Received products (ngOnChanges):', this.products);
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  trackById(index: number, item: IProduct) {
    return item?.id ?? index;
  }


  get showActions(): boolean {
    return !!this.areActionsAvailable && !!this.isSuperAdmin;
  }

  private checkRole() {
    try {
      this.isSuperAdmin = !!(this.auth.isSuperAdmin && this.auth.isSuperAdmin() || (this.auth.hasRole && this.auth.hasRole('ADMIN')));
      if ((this.auth as any).currentUser$) {
        this.sub = (this.auth as any).currentUser$.subscribe(() => {
          this.isSuperAdmin = !!(this.auth.isSuperAdmin && this.auth.isSuperAdmin() || (this.auth.hasRole && this.auth.hasRole('ADMIN')));
        });
      }
    } catch {
      this.isSuperAdmin = false;
    }
  }

  private userIsSuper(u: any): boolean {
    if (!u) return false;
    // permitir tanto SUPER_ADMIN como ADMIN
    if (Array.isArray(u.roles) && (u.roles.includes('SUPER_ADMIN') || u.roles.includes('ADMIN'))) return true;
    if (u.role === 'SUPER_ADMIN' || u.role === 'ADMIN') return true;
    if (Array.isArray(u.authorities) && u.authorities.some((a: any) => String(a).includes('SUPER_ADMIN') || String(a).includes('ADMIN'))) return true;
    return false;
  }

  categoryNameFor(product: IProduct): string {
    if (product?.categoriaNombre) return product.categoriaNombre;
    const catObjName = product?.categoria?.nombre;
    if (catObjName) return catObjName;
    const pid = product?.id;
    if (pid != null && this.productCategoryNameMap && this.productCategoryNameMap[pid]) {
      return this.productCategoryNameMap[pid];
    }
    const cid = product?.categoria?.id ?? product?.categoriaId;
    if (cid != null && this.categoriesMap && this.categoriesMap[cid]) return this.categoriesMap[cid];
    return '-';
  }
}
