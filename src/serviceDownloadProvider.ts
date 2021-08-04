/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';
import * as fs from 'fs';
import * as tar from 'tar';
import * as mkdirp from 'mkdirp';
import { EventEmitter2 as EventEmitter } from 'eventemitter2';
import * as tmp from 'tmp';
import * as path from 'path';

import { Runtime, getRuntimeDisplayName } from './platform';
import { IConfig, IPackage, Events, IRetryOptions } from './interfaces';
import { HttpClient } from './httpClient';
import { PlatformNotSupportedError, DistributionNotSupportedError } from './errors';
import { promisify } from 'util';
import * as asyncRetry from 'async-retry';
import { ArchiveExtractor } from './extractor';
/*
* Service Download Provider class which handles downloading the service client
*/
export class ServiceDownloadProvider {

    private httpClient = new HttpClient();
    private extractor = new ArchiveExtractor();
    public readonly eventEmitter = new EventEmitter({ wildcard: true });

    constructor(
        private _config: IConfig
    ) {
        // Ensure our temp files get cleaned up in case of error.
        tmp.setGracefulCleanup();
        this.httpClient.eventEmitter.onAny((e, ...args) => {
            this.eventEmitter.emit(e, ...args);
        });
        this.extractor.eventEmitter.onAny((e, ...args) => {
            this.eventEmitter.emit(e, ...args);
        });
    }

    /**
     * Returns the download url for given platform
     */
    public getDownloadFileName(platform: Runtime): string {
        let fileNamesJson = this._config.downloadFileNames;
        let fileName = fileNamesJson[platform];

        if (fileName === undefined) {
            if (process.platform === 'linux') {
                throw new DistributionNotSupportedError('Unsupported linux distribution', process.platform, platform.toString());
            } else {
                throw new PlatformNotSupportedError(`Unsupported platform: ${process.platform}`, process.platform);
            }
        }

        return fileName;
    }

    /**
     * Returns SQL tools service installed folder.
     */
    public getInstallDirectory(platform: Runtime): string {
        let basePath = this._config.installDirectory;
        let versionFromConfig = this._config.version;
        basePath = basePath.replace('{#version#}', versionFromConfig);
        basePath = basePath.replace('{#platform#}', getRuntimeDisplayName(platform));
        if (!fs.existsSync(basePath)) {
            mkdirp.sync(basePath);
        }

        return basePath;
    }

    private getGetDownloadUrl(fileName: string): string {
        let baseDownloadUrl = this._config.downloadUrl;
        let version = this._config.version;
        baseDownloadUrl = baseDownloadUrl.replace('{#version#}', version);
        baseDownloadUrl = baseDownloadUrl.replace('{#fileName#}', fileName);
        return baseDownloadUrl;
    }

    /**
     * Downloads the service and decompress it in the install folder.
     */
    public async installService(platform: Runtime): Promise<boolean> {
        const proxy = this._config.proxy;
        const strictSSL = this._config.strictSSL;
        const fileName = this.getDownloadFileName(platform);
        const installDirectory = this.getInstallDirectory(platform);
        const urlString = this.getGetDownloadUrl(fileName);

        const pkg: IPackage = {
            installPath: installDirectory,
            url: urlString,
            tmpFile: undefined
        };

        const existsAsync = promisify(fs.exists);
        const unlinkAsync = promisify(fs.unlink);
        const downloadAndInstall: () => Promise<void> = async () => {
            try {
                pkg.tmpFile = await this.createTempFile(pkg);
                console.info(`\tdownloading the package: ${pkg.url}`);
                console.info(`\t                to file: ${pkg.tmpFile.name}`);
                await this.httpClient.downloadFile(pkg.url, pkg, proxy, strictSSL);
                console.info(`\tinstalling the package from file: ${pkg.tmpFile.name}`);
                await this.install(pkg);

            } finally {
                // remove the downloaded package file
                if (await existsAsync(pkg.tmpFile.name)) {
                    await unlinkAsync(pkg.tmpFile.name);
                    console.info(`\tdeleted the package file: ${pkg.tmpFile.name}`);
                }
            }
        };

        // if this._config.retry is not defined then this.withRetry defaults to number of retries of 0
        // which is same as without retries.
        await withRetry(downloadAndInstall, this._config.retry);
        return true;
    }

    private createTempFile(pkg: IPackage): Promise<tmp.SynchrounousResult> {
        return new Promise<tmp.SynchrounousResult>((resolve, reject) => {
            tmp.file({ prefix: 'package-', postfix: path.extname(pkg.url) }, (err, filepath, fd, cleanupCallback) => {
                if (err) {
                    return reject(new Error('Error from tmp.file'));
                }

                resolve(<tmp.SynchrounousResult>{ name: filepath, fd: fd, removeCallback: cleanupCallback });
            });
        });
    }

    private async install(pkg: IPackage): Promise<void> {
        this.eventEmitter.emit(Events.INSTALL_START, pkg.url);
        await this.extractor.extract(pkg.tmpFile.name, pkg.installPath);
        this.eventEmitter.emit(Events.INSTALL_END);
    }
}

async function withRetry(promiseToExecute: () => Promise<any>, retryOptions: IRetryOptions = { retries: 0 }): Promise<any> {
    // wrap function execution with a retry promise
    // by default, it retries 10 times while backing off exponentially.
    // retryOptions parameter can be used to configure how many and how often the retries happen.
    // https://www.npmjs.com/package/promise-retry
    return await asyncRetry<any>(
        async (bail: (e: Error) => void, attemptNo: number) => {
            try {
                // run the main operation
                return await promiseToExecute();
            } catch (error) {
                if (/403/.test(error)) {
                    // don't retry upon 403
                    bail(error);
                    return;
                }
                if (attemptNo <= retryOptions.retries) {
                    console.warn(`[${(new Date()).toLocaleTimeString('en-US', { hour12: false })}] `
                        + `Retrying...   as attempt:${attemptNo} to run '${promiseToExecute.name}' failed with: '${error}'.`);
                }
                // throw back any other error so it can get retried by asyncRetry as appropriate
                throw error;
            }
        },
        retryOptions
    );
}
