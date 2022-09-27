import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { ASSETS } from 'src/assets';

@Component({
    selector: 'app-logo-img',
    templateUrl: './logo-img.component.html',
    styleUrls: ['./logo-img.component.scss']
})
export class LogoImgComponent implements OnInit {
    @Input() size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';

    private readonly _sizeMappings = new Map<string, string>([
        ['xs', '16px'],
        ['sm', '20px'],
        ['md', '27px'],
        ['lg', '35px'],
        ['xl', '45px']
    ]);

    constructor() {}

    ngOnInit() {}

    @HostBinding('style')
    get hostStyle() {
        const size = this._sizeMappings.get(this.size);
        return {
            width: size,
            height: size
        };
    }

    get src(): string {
        return ASSETS.qrCode;
    }
}
