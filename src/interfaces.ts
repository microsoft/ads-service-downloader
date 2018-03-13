/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as tmp from 'tmp';

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

export const enum Events {
    /**
     * Download start, downloading url and data will be the size of the download in bytes
     */
    DOWNLOAD_START = 'download_start',
    /**
     * Download progress event, data will be the current progress of the download
     */
    DOWNLOAD_PROGRESS = 'download_progress',
    /**
     * Download end 
     */
    DOWNLOAD_END = 'download_end',
    /**
     * Install Start, data will be install directory
     */
    INSTALL_START = 'install_start',
    /**
     * Install End
     */
    INSTALL_END = 'install_end'
}
