import { Runtime } from './platform';
import { IConfig } from './interfaces';
import { ILogger } from './interfaces';
export declare class ServiceDownloadProvider {
    private _config;
    private _logger;
    private httpClient;
    constructor(_config: IConfig, _logger?: ILogger);
    private appendLine(m);
    /**
     * Returns the download url for given platform
     */
    getDownloadFileName(platform: Runtime): string;
    /**
     * Returns SQL tools service installed folder.
     */
    getInstallDirectory(platform: Runtime): string;
    private getLocalUserFolderPath(platform);
    /**
     * Returns SQL tools service installed folder root.
     */
    getInstallDirectoryRoot(platform: Runtime): string;
    private getGetDownloadUrl(fileName);
    /**
     * Downloads the service and decompress it in the install folder.
     */
    installService(platform: Runtime): Promise<boolean>;
    private createTempFile(pkg);
    private install(pkg);
}
