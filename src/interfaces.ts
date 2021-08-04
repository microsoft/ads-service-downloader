/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as tmp from 'tmp';

export interface IPackage {
    url: string;
    installPath?: string;
    tmpFile: tmp.SynchrounousResult;
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
    /**
     * Optional configuration for retries.
     * Enabled flag is used to turn it on or off. It is off by default.
     * Options object is a pass through configuration to the http://npmjs.org/retry module.
     */
    retry?: IRetryOptions;
}

/**
 * Retry configuration passed to the http://npmjs.org/promise-retry module.
 * See http://npmjs.org/retry for more details on these options.
 */
export interface IRetryOptions {
    /**
     * The maximum amount of times to retry the operation. Default is 10. Setting this to 1 means do it once, then retry it once.
     */
    retries?: number;
    /**
     * The exponential factor to use. Default is 2.
     */
    factor?: number;
    /**
     * The number of milliseconds before starting the first retry. Default is 1000.
     */
    minTimeout?: number;
    /**
     * The maximum number of milliseconds between two retries. Once this value is reached the timeout between successive
     * retries is the value configured for this field. Default is Infinity.
     */
    maxTimeout?: number;
    /**
     * Randomizes the timeouts by multiplying with a factor between 1 to 2. Default is false.
     */
    randomize?: boolean;
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
     * Entry extracted from downloaded archive.
     * Data :
     *  0 : Path to file/folder
     *  1 : Entry number
     *  2 : Total number of entries
     */
    ENTRY_EXTRACTED = 'entry_extracted',
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
