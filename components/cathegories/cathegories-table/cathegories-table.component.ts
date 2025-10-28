import { Component, EventEmitter, Input, Output, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICathegory} from '../../../interfaces';
import { AuthService } from '../../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cathegories-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cathegories-table.component.html',
  styleUrls: ['./cathegories-table.component.scss']
})
export class CathegoriesTableComponent implements OnDestroy {
  @Input() cathegories: ICathegory[] = [];
  @Input() areActionsAvailable: boolean = false;
  @Output() callEditMethod: EventEmitter<ICathegory> = new EventEmitter<ICathegory>();
  @Output() callDeleteMethod: EventEmitter<ICathegory> = new EventEmitter<ICathegory>();

  private auth = inject(AuthService) as any;
  private sub: Subscription | null = null;
  public isSuperAdmin = false;

  ngOnInit() {
    console.log('CathegoriesTableComponent initialized, inputs:', this.cathegories);
    this.checkRole();
  }

  ngOnChanges() {
    console.log('Received cathegories (ngOnChanges):', this.cathegories);
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  trackById(index: number, item: ICathegory) {
    return item?.id ?? index;
  }

  get showActions(): boolean {
    return !!this.areActionsAvailable && !!this.isSuperAdmin;
  }

  private checkRole() {
    try {
      // Usa los helpers del AuthService ya existentes
      this.isSuperAdmin = !!(this.auth.isSuperAdmin && this.auth.isSuperAdmin() || (this.auth.hasRole && this.auth.hasRole('ADMIN')));
      // si el servicio expone currentUser$ suscríbete para actualizaciones
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
}