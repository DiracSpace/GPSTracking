import { icon, latLng, Map, MapOptions, marker, popup, tileLayer } from 'leaflet';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ASSETS } from 'src/assets';
import { Logger, LogLevel } from 'src/app/logger';
import { environment } from 'src/environments/environment';

const logger = new Logger({
    source: 'LocationComponent',
    level: LogLevel.Debug
});

@Component({
    selector: 'app-location',
    templateUrl: './location.component.html',
    styleUrls: ['./location.component.scss']
})
export class LocationComponent implements OnInit {
    @Input() longitude = -121.726909;
    @Input() latitude = 46.879966;

    private _hidden = false;
    get hidden() {
        return this._hidden;
    }
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
                tileLayer(this.url, {
                    className: 'map-tiles',
                    maxZoom: 18
                }),
                marker([this.latitude, this.longitude], {
                    icon: icon({
                        iconUrl: ASSETS.leafletCursor,
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

    get url() {
        const apiKey = environment.apiKeys.stadiaMaps;

        if (!apiKey) {
            throw 'No API key provided for StadiaMaps';
        }

        // TODO: this is NOT secure at all, but for development purposes we shall leave it
        return `https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?api_key=${apiKey}`;
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
