import { Component, OnInit } from '@angular/core';
import { Logger, LogLevel } from './logger';

const logger = new Logger({
  level: LogLevel.Debug,
  source: 'AppComponent',
});

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor() {}
  ngOnInit(): void {
    logger.debug('Logger working!')
  }
}
