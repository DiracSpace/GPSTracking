import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { Logger, LogLevel } from 'src/app/logger';
import { ContextService } from 'src/app/services/context.service';
import { ToastsService } from 'src/app/services/popups/toasts.service';

const logger = new Logger({
    source: 'LoadingImgComponent',
    level: LogLevel.Off
});

@Component({
    selector: 'app-loading-img',
    templateUrl: './loading-img.component.html',
    styleUrls: ['./loading-img.component.scss']
})
export class LoadingImgComponent implements OnInit, OnDestroy {
    @ViewChild('loadingImg', { static: true })
    loadingImg: ElementRef<HTMLImageElement> = null;

    private qrImgSrcSubscription: Subscription;

    constructor(private context: ContextService, private toast: ToastsService) {}

    ngOnInit() {
        this.qrImgSrcSubscription = this.context.qrImgSrc.watch().subscribe(
            (value: string) => {
                logger.log('value:', value);
                const downloadingImg = new Image();
                downloadingImg.onload = () => {
                    logger.log('onloaded!');
                    const { nativeElement } = this.loadingImg;
                    if (nativeElement) {
                        nativeElement.src = value;
                    }
                };
                downloadingImg.src = value;
            },
            async (error: any) => {
                await this.toast.presentToastAsync(error, 'danger');
            }
        );
    }

    ngOnDestroy(): void {
        if (this.qrImgSrcSubscription) {
            this.qrImgSrcSubscription.unsubscribe();
            this.qrImgSrcSubscription = null;
        }
    }
}
