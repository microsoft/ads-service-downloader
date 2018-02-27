import { IPackage } from './interfaces';
import { ILogger } from './interfaces';
export default class HttpClient {
    downloadFile(urlString: string, pkg: IPackage, logger: ILogger, proxy?: string, strictSSL?: boolean): Promise<void>;
    private getHttpClientOptions(url, proxy?, strictSSL?);
    handleDataReceivedEvent(progress: IDownloadProgress, data: any, logger: ILogger): void;
    private handleSuccessfulResponse(pkg, response, logger);
}
export interface IDownloadProgress {
    packageSize: number;
    downloadedBytes: number;
    downloadPercentage: number;
    dots: number;
}
