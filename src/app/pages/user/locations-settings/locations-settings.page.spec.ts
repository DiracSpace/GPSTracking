import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LocationsSettingsPage } from './locations-settings.page';

describe('LocationsSettingsPage', () => {
    let component: LocationsSettingsPage;
    let fixture: ComponentFixture<LocationsSettingsPage>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [LocationsSettingsPage],
            imports: [IonicModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(LocationsSettingsPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
