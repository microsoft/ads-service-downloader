/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import * as path from 'path';
import * as fs from 'fs';
import { EventEmitter2 as EventEmitter } from 'eventemitter2';

import { Runtime, PlatformInformation } from './platform';
import { ServiceDownloadProvider } from './serviceDownloadProvider';
import { IConfig } from './interfaces';

/*
* Service Provider class finds the SQL tools service executable file or downloads it if doesn't exist.
*/
export class ServerProvider {

	public readonly eventEmitter = new EventEmitter({ wildcard: true });

    private _downloadProvider = new ServiceDownloadProvider(this.config);

    private _runtime: Runtime;
    public get runtime(): Promise<Runtime> {
        if (!this._runtime) {
            return this.findRuntime().then(r => {
                this._runtime = r;
                return r;
            });
        }
        return Promise.resolve(this._runtime);
    }

    constructor(
        private config: IConfig
    ) {
        this._downloadProvider.eventEmitter.onAny((e, ...args) => {
            this.eventEmitter.emit(e, ...args);
        });
    }

    /**
     * Public get method for downloadProvider
     */
    public get downloadProvider(): ServiceDownloadProvider {
        return this._downloadProvider;
    }

    private findRuntime(): Promise<Runtime> {
        return PlatformInformation.getCurrent().then(p => {
            return p.runtimeId;
        });
    }

    /**
     * Given a file path, returns the path to the SQL Tools service file.
     */
    public findServerPath(filePath: string, executableFiles: string[] = undefined): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            fs.stat(filePath, (er, stats) => {
                // If a file path was passed, assume its the launch file.
                if (stats.isFile()) {
                    resolve(filePath);
                }
    
                // Otherwise, search the specified folder.
                let candidate: string;
    
                if (executableFiles === undefined && this.config !== undefined) {
                    executableFiles = this.config.executableFiles;
                }
                if (executableFiles !== undefined) {
                    executableFiles.forEach(element => {
                        let executableFile = path.join(filePath, element);
                        if (candidate === undefined && fs.existsSync(executableFile)) {
                            candidate = executableFile;
                            resolve(candidate);
                        }
                    });
                }
    
    
                resolve(candidate);
            });
        });
    }

   /**
    * Download the service if doesn't exist and returns the file path.
    */
    public getOrDownloadServer(): Promise<string> {
        // Attempt to find launch file path first from options, and then from the default install location.
        // If SQL tools service can't be found, download it.
        return this.getServerPath().then(result => {
            if (result === undefined) {
                return this.downloadServerFiles().then(downloadResult => {
                    return downloadResult;
                });
            } else {
                return result;
            }
        });
    }

   /**
    * Returns the path of the installed service
    */
    public getServerPath(): Promise<string> {
        return this.runtime.then(r => {
            const installDirectory = this._downloadProvider.getInstallDirectory(r);
            return this.findServerPath(installDirectory);
        });
    }

   /**
    * Downloads the service and returns the path of the installed service
    */
    public downloadServerFiles(): Promise<string> {
        return this.runtime.then(r => {
            const installDirectory = this._downloadProvider.getInstallDirectory(r);
            return this._downloadProvider.installService(r).then( _ => {
                return this.findServerPath(installDirectory);
            });
        });
    }
}
