import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICathegory} from '../../../interfaces';

@Component({
  selector: 'app-cathegories-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cathegories-table.component.html',
  styleUrls: ['./cathegories-table.component.scss']
})
export class CathegoriesTableComponent {
  @Input() cathegories: ICathegory[] = [];
  @Input() areActionsAvailable: boolean = false;
  @Output() callEditMethod: EventEmitter<ICathegory> = new EventEmitter<ICathegory>();
  @Output() callDeleteMethod: EventEmitter<ICathegory> = new EventEmitter<ICathegory>();
  ngOnInit() {
    console.log('CathegoriesTableComponent initialized, inputs:', this.cathegories);
  }

  ngOnChanges() {
    console.log('Received cathegories (ngOnChanges):', this.cathegories);
  }

  trackById(index: number, item: ICathegory) {
    return item?.id ?? index;
  }
}