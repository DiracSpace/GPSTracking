import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Logger, LogLevel } from 'src/app/logger';

export type CardItemIdTypes =
    | 'Basic Information'
    | 'Phone Numbers'
    | 'Addresses'
    | 'Diseases'
    | 'Alegies'
    | '';
export type CardItemStatusTypes = 'completado' | 'incompleto';

export interface CardItem {
    primaryTitle: string;
    secondaryTitle?: string;
    status?: CardItemStatusTypes;
    id?: CardItemIdTypes;
    action?: () => void;
    route?: string;
    icon: string;
}

const logger = new Logger({
    source: 'CardItemComponent',
    level: LogLevel.Debug
});

@Component({
    selector: 'app-card-item',
    templateUrl: './card-item.component.html',
    styleUrls: ['./card-item.component.scss']
})
export class CardItemComponent implements OnInit {
    @Output() clicked = new EventEmitter<void>();
    @Input() displayStatus: boolean = false;
    @Input() cardItem: CardItem;

    constructor() {}

    ngOnInit() {}

    get hasProvidedContent() {
        return this.cardItem != null;
    }

    get hasProvidedStatus() {
        return this.cardItem.status != null;
    }

    get badgeClass() {
        let classes = ['badge'];

        if (this.cardItem.status && this.cardItem.status == 'completado') {
            classes.push('badge-success');
        } else {
            classes.push('badge-warning');
        }

        return classes;
    }

    onDetailClicked() {
        if (this.cardItem.action) {
            this.cardItem.action();
        }

        this.clicked.emit();
    }
}
