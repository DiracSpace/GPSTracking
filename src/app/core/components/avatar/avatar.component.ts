import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Logger, LogLevel } from 'src/app/logger';
import { ASSETS } from 'src/assets';

const logger = new Logger({
    source: 'AvatarComponent',
    level: LogLevel.Off
});

const avatarSize = new Map<string, string>([
    ['xs', '22px'],
    ['sm', '32px'],
    ['md', '48px'],
    ['lg', '70px'],
    ['xl', '150px'],
    ['xxl', '180px']
]);

@Component({
    selector: 'app-avatar',
    templateUrl: './avatar.component.html',
    styleUrls: ['./avatar.component.scss']
})
export class AvatarComponent implements OnInit {
    @Input() size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' = 'sm';
    @Input() imgSrc: string = ASSETS.avatar;
    @Input() customClasses: any[];
    @Input() customStyle: any;

    @Output() clicked = new EventEmitter<void>();

    constructor() {}

    ngOnInit() {}

    get avatarStyle() {
        let style = {
            width: avatarSize.get(this.size),
            height: avatarSize.get(this.size)
        };

        if (this.customStyle) {
            style = { ...style, ...this.customStyle };
        }

        logger.log('style:', style);
        return style;
    }

    get avatarClass() {
        const classes = [];

        if (this.customClasses) {
            classes.push(this.customClasses);
        }

        logger.log('classes:', classes);
        return classes;
    }
}
