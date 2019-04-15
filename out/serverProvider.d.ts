import { EventEmitter2 as EventEmitter } from 'eventemitter2';
import { Runtime } from './platform';
import { ServiceDownloadProvider } from './serviceDownloadProvider';
import { IConfig } from './interfaces';
export declare class ServerProvider {
    private config;
    readonly eventEmitter: EventEmitter;
    private _downloadProvider;
    private _runtime;
    readonly runtime: Promise<Runtime>;
    constructor(config: IConfig);
    /**
     * Public get method for downloadProvider
     */
    readonly downloadProvider: ServiceDownloadProvider;
    private findRuntime();
    /**
     * Given a file path, returns the path to the SQL Tools service file.
     */
    findServerPath(filePath: string, executableFiles?: string[]): Promise<string>;
    /**
     * Download the service if doesn't exist and returns the file path.
     */
    getOrDownloadServer(): Promise<string>;
    /**
     * Returns the path of the installed service
     */
    getServerPath(): Promise<string>;
    /**
     * Downloads the service and returns the path of the installed service
     */
    downloadServerFiles(): Promise<string>;
}
