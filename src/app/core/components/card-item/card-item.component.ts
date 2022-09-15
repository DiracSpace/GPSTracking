import { Component, Input, OnInit } from '@angular/core';
import { Logger, LogLevel } from 'src/app/logger';

export type CardItemStatusTypes = 'completado' | 'incompleto';
export interface CardItem {
    primaryTitle: string;
    secondaryTitle?: string;
	status?: CardItemStatusTypes;
	icon: string;
}

const logger = new Logger({
	source: 'CardItemComponent',
	level: LogLevel.Debug
})

@Component({
    selector: 'app-card-item',
    templateUrl: './card-item.component.html',
    styleUrls: ['./card-item.component.scss']
})
export class CardItemComponent implements OnInit {
    @Input() cardItem: CardItem;

    constructor() {}

    ngOnInit() {}

	get hasProvidedContent() {
		return this.cardItem != null;
	}

	get hasProvidedStatus() {
		return this.cardItem.status != null;
	}

	onDetailClicked() {
		logger.log("detail clicked!");
	}
}
