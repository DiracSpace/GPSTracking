import { icon, latLng, Map, MapOptions, marker, popup, tileLayer } from 'leaflet';
import { Component, Input, OnInit } from '@angular/core';
import { Assets } from 'src/assets';

@Component({
    selector: 'app-location',
    templateUrl: './location.component.html',
    styleUrls: ['./location.component.scss']
})
export class LocationComponent implements OnInit {
    @Input() longitude: number = -121.726909;
    @Input() latitude: number = 46.879966;
    options: MapOptions = null;

    constructor() {}

    ngOnInit() {
        this.options = {
            layers: [
                tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
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
        setTimeout(() => {
            map.invalidateSize();
        }, 0);
    }
}
