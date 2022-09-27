import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-information-display',
    templateUrl: './information-display.component.html',
    styleUrls: ['./information-display.component.scss']
})
export class InformationDisplayComponent implements OnInit {
    @Input() title = 'Título';
    @Input() content = 'Contenido';
    @Input() classes: string[] = [];

    constructor() {}

    ngOnInit() {}

    get displayClasses() {
        const classes = [];

        if (this.classes && this.classes.length > 0) {
            classes.push(...this.classes);
        }

        return classes;
    }
}
