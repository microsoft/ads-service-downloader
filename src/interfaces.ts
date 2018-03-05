import * as tmp from 'tmp';

export interface ILogger {
    append(message: string): void;
    appendLine(message: string): void;
}

export interface IPackage {
    url: string;
    installPath?: string;
    tmpFile: tmp.SynchronousResult;
}

export interface IConfig {
    downloadFileNames: { [platform: string]: string };
    version: string;
    installDirectory: string;
    downloadUrl: string;
    proxy: string;
    strictSSL: boolean;
    executableFiles: Array<string>;
}
