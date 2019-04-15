import { EventEmitter2 as EventEmitter } from 'eventemitter2';
import { IPackage } from './interfaces';
export declare class HttpClient {
    readonly eventEmitter: EventEmitter;
    downloadFile(urlString: string, pkg: IPackage, proxy?: string, strictSSL?: boolean): Promise<void>;
    private getHttpClientOptions(url, proxy?, strictSSL?);
    handleDataReceivedEvent(progress: IDownloadProgress, data: any): void;
    private handleSuccessfulResponse(pkg, response);
}
export interface IDownloadProgress {
    packageSize: number;
    downloadedBytes: number;
    downloadPercentage: number;
}
