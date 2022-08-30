import { Component, HostBinding, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-logo',
    templateUrl: './logo.component.html',
    styleUrls: ['./logo.component.scss']
})
export class LogoComponent implements OnInit {
    @Input() size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';

    private readonly _fontSizeMappings = new Map<string, string>([
        ['xs', '0.9rem'],
        ['sm', '1.1rem'],
        ['md', '1.5rem'],
        ['lg', '2rem'],
        ['xl', '2.7rem']
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
