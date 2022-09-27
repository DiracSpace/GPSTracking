import { LogLevel } from './LogLevel';

export class GlobalLoggerConfig {
    static level?: LogLevel = LogLevel.Debug;
    static ignoreSources?: string[] = [];

    static addIgnoreSource(source: string) {
        this.ignoreSources?.push(source);
    }

    static hasIgnoreSource(source: string): boolean {
        const index = this.ignoreSources?.indexOf(source);
        return index != undefined && index != -1;
    }

    static removeIgnoreSource(source: string) {
        const index = this.ignoreSources?.indexOf(source);

        if (index == undefined) {
            return;
        }

        this.ignoreSources?.splice(index);
    }

    static enableProductionMode() {
        this.level = LogLevel.Off;
    }
}
