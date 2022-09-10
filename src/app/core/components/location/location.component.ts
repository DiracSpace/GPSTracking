import { icon, latLng, Map, MapOptions, marker, popup, tileLayer } from 'leaflet';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Assets } from 'src/assets';
import { Logger, LogLevel } from 'src/app/logger';

const logger = new Logger({
    source: 'LocationComponent',
    level: LogLevel.Debug,
})

@Component({
    selector: 'app-location',
    templateUrl: './location.component.html',
    styleUrls: ['./location.component.scss']
})
export class LocationComponent implements OnInit {
    @Input() longitude: number = -121.726909;
    @Input() latitude: number = 46.879966;
    
    private _hidden: boolean = false;
    get hidden() { return this._hidden }
    @Input() set hidden(hidden: boolean) {
        this._hidden = hidden;
        
        if (this.componentMap) {
            this.onMapReady(this.componentMap);
        } else {
            // TODO: show template or message
        }
    }
    @Output() hiddenChange = new EventEmitter<boolean>();

    private componentMap: Map = null;
    options: MapOptions = null;

    constructor() {}

    ngOnInit() {
        this.options = {
            layers: [
                tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
                    className: 'map-tiles',
                    maxZoom: 18
                }),
                marker([this.latitude, this.longitude], {
                    icon: icon({
                        iconUrl: Assets.leafletCursor,
                        iconSize: [20, 20],
                        iconAnchor: [13, 41]
                    })
                })
            ],
            zoom: 16,
            center: latLng(this.latitude, this.longitude),
            attributionControl: false,
            scrollWheelZoom: false,
            zoomControl: false,
            touchZoom: false,
            dragging: false
        };
    }

    get areOptionsReady() {
        return this.options != null;
    }

    onMapReady(map: Map) {
        this.componentMap = map;
        setTimeout(() => {
            map.invalidateSize(true);
        }, 100);
    }
}
