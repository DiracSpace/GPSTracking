import { Component, HostBinding, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-logo',
    templateUrl: './logo.component.html',
    styleUrls: ['./logo.component.scss']
})
export class LogoComponent implements OnInit {
    @Input() size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';

    private readonly _fontSizeMappings = new Map<string, string>([
        ['xs', '1.3rem'],
        ['sm', '1.8rem'],
        ['md', '2.5rem'],
        ['lg', '3.3rem'],
        ['xl', '3.9rem']
    ]);

    private readonly _logoImgMarginMappings = new Map<string, string>([
        ['xs', '2px'],
        ['sm', '4px'],
        ['md', '6px'],
        ['lg', '8px'],
        ['xl', '10px']
    ]);

    constructor() {}

    ngOnInit() {}

    @HostBinding('style')
    get hostStyle() {
        return {
            'font-size': this._fontSizeMappings.get(this.size)
        };
    }

    get logoImgStyle() {
        return {
            'margin-right': this._logoImgMarginMappings.get(this.size)
        };
    }
}
