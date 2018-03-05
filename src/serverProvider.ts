/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import * as path from 'path';
import * as fs from 'fs';
import { Runtime } from './platform';
import ServiceDownloadProvider from './serviceDownloadProvider';
import { IConfig } from './interfaces';


/*
* Service Provider class finds the SQL tools service executable file or downloads it if doesn't exist.
*/
export default class ServerProvider {

    constructor(private _downloadProvider: ServiceDownloadProvider,
                private _config: IConfig,
                private _extensionConfigSectionName: string) {
    }

    /**
     * Public get method for downloadProvider
     */
    public get downloadProvider(): ServiceDownloadProvider {
        return this._downloadProvider;
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
    
                if (executableFiles === undefined && this._config !== undefined) {
                    executableFiles = this._config.executableFiles;
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
    public getOrDownloadServer(runtime: Runtime): Promise<string> {
        // Attempt to find launch file path first from options, and then from the default install location.
        // If SQL tools service can't be found, download it.
        return this.getServerPath(runtime).then(result => {
            if (result === undefined) {
                return this.downloadServerFiles(runtime).then(downloadResult => {
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
    public getServerPath(runtime: Runtime): Promise<string> {
        const installDirectory = this._downloadProvider.getInstallDirectory(runtime);
        return this.findServerPath(installDirectory);
    }

   /**
    * Downloads the service and returns the path of the installed service
    */
    public downloadServerFiles(runtime: Runtime): Promise<string> {
        const installDirectory = this._downloadProvider.getInstallDirectory(runtime);
        return this._downloadProvider.installService(runtime).then( _ => {
            return this.findServerPath(installDirectory);
        });
    }
}
