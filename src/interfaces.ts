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
    /**
     * A map from the platform string to the filename to look for in the download url
     */
    downloadFileNames: { [platform: string]: string };
    version: string;
    /**
     * Absolute path for the install directory of the service.
     * If {#version#} is present in the string, the version will be inserted in the string.
     * If {#platform#} is present in the string, the platform will be inserted in the string.
     */
    installDirectory: string;
    /**
     * Url to download the service from
     * If {#version#} is present in the string, the version will be inserted in the string
     * If {#fileName#} is present in the string, the filename determined from the downloadFileNames property will be inserted
     */
    downloadUrl: string;
    proxy: string;
    strictSSL: boolean;
    executableFiles: Array<string>;
}

export const enum Events {
    /**
     * Download start, data will be downloading url and size of the download in bytes
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

export const enum ErrorCodes {
    ERR_PLATFORM_NOT_SUPPORTED,
    ERR_DISTRIBUTION_NOT_SUPPORTED,
    ERR_ARCHITECTURE_NOT_SUPPORTED
}
