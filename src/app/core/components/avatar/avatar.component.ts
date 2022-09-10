import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Assets } from 'src/assets';

@Component({
    selector: 'app-avatar',
    templateUrl: './avatar.component.html',
    styleUrls: ['./avatar.component.scss']
})
export class AvatarComponent implements OnInit {
	@Input() imgSrc: string = Assets.avatar;
	@Input() height: string = "48px";
	@Input() width: string = "48px";

	@Output() clicked = new EventEmitter<void>();

    constructor() {}

    ngOnInit() {}

	get avatarStyle() {
		return {
			width: this.width,
			height: this.height
		}
	}
}
