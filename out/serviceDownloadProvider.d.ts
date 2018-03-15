import { EventEmitter2 as EventEmitter } from 'eventemitter2';
import { Runtime } from './platform';
import { IConfig } from './interfaces';
export declare class ServiceDownloadProvider {
    private _config;
    private httpClient;
    readonly eventEmitter: EventEmitter;
    constructor(_config: IConfig);
    /**
     * Returns the download url for given platform
     */
    getDownloadFileName(platform: Runtime): string;
    /**
     * Returns SQL tools service installed folder.
     */
    getInstallDirectory(platform: Runtime): string;
    private getLocalUserFolderPath(platform);
    private getGetDownloadUrl(fileName);
    /**
     * Downloads the service and decompress it in the install folder.
     */
    installService(platform: Runtime): Promise<boolean>;
    private createTempFile(pkg);
    private install(pkg);
}
