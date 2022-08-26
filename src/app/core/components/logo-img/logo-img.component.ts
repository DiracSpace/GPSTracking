import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { Assets } from 'src/assets';

@Component({
    selector: 'app-logo-img',
    templateUrl: './logo-img.component.html',
    styleUrls: ['./logo-img.component.scss']
})
export class LogoImgComponent implements OnInit {
    @Input() size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';

    private readonly _sizeMappings = new Map<string, string>([
        ['xs', '20px'],
        ['sm', '30px'],
        ['md', '40px'],
        ['lg', '50px'],
        ['xl', '60px']
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
        return Assets.qrCode;
    }
}
