/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as https from 'https';
import * as http from 'http';
import * as fs from 'fs';
import { parse as parseUrl, Url } from 'url';
import { EventEmitter2 as EventEmitter } from 'eventemitter2';

import { IPackage, Events } from './interfaces';
import { getProxyAgent } from './proxy';

/*
 * Http client class to handle downloading files using http or https urls
 */
export class HttpClient {

	public readonly eventEmitter = new EventEmitter({ wildcard: true });

   /*
    * Downloads a file and stores the result in the temp file inside the package object
    */
    public downloadFile(urlString: string, pkg: IPackage, proxy?: string, strictSSL?: boolean): Promise<void> {
        const url = parseUrl(urlString);
        let options = this.getHttpClientOptions(url, proxy, strictSSL);
        let clientRequest = url.protocol === 'http:' ? http.request : https.request;

        return new Promise<void>((resolve, reject) => {
            if (!pkg.tmpFile || pkg.tmpFile.fd === 0) {
                return reject(new Error('Temporary package file unavailable'));
            }

            let request = clientRequest(options, response => {
                if (response.statusCode === 301 || response.statusCode === 302) {
                    // Redirect - download from new location
                    return resolve(this.downloadFile(response.headers.location, pkg, proxy, strictSSL));
                }

                if (response.statusCode !== 200) {
                    // Download failed - print error message
                    return reject(new Error(response.statusCode.toString()));
                }

                // If status code is 200
                this.handleSuccessfulResponse(pkg, response).then(_ => {
                    resolve();
                }).catch(err => {
                    reject(err);
                });
            });

            request.on('error', error => {
                // reject(new PackageError(`Request error: ${error.code || 'NONE'}`, pkg, error));
                reject(new Error(`Request error: ${error.name || 'NONE'}`));
            });

            // Execute the request
            request.end();
        });
    }

    private getHttpClientOptions(url: Url, proxy?: string, strictSSL?: boolean): any {
        const agent = getProxyAgent(url, proxy, strictSSL);

        let options: http.RequestOptions = {
            host: url.hostname,
            path: url.path,
            agent: agent,
            port: +url.port
        };

        if (url.protocol === 'https:') {
            let httpsOptions: https.RequestOptions = {
                    host: url.hostname,
                    path: url.path,
                    agent: agent,
                    port: +url.port
            };
            options = httpsOptions;
        }

        return options;
    }

   /*
    * Calculate the download percentage and stores in the progress object
    */
    public handleDataReceivedEvent(progress: IDownloadProgress, data: any): void {
        progress.downloadedBytes += data.length;

        // Update status bar item with percentage
        if (progress.packageSize > 0) {
            let newPercentage = Math.ceil(100 * (progress.downloadedBytes / progress.packageSize));
            if (newPercentage !== progress.downloadPercentage) {
                this.eventEmitter.emit(Events.DOWNLOAD_PROGRESS, newPercentage);
                progress.downloadPercentage = newPercentage;
            }
        }
        return;
    }

    private handleSuccessfulResponse(pkg: IPackage, response: http.IncomingMessage): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let progress: IDownloadProgress = {
                packageSize: parseInt(response.headers['content-length'], 10),
                downloadedBytes: 0,
                downloadPercentage: 0
            };
            this.eventEmitter.emit(Events.DOWNLOAD_START, pkg.url, progress.packageSize);
            response.on('data', data => {
                this.handleDataReceivedEvent(progress, data);
            });
            let tmpFile = fs.createWriteStream(undefined, { fd: pkg.tmpFile.fd });
            response.on('end', () => {
                this.eventEmitter.emit(Events.DOWNLOAD_END);
                resolve();
            });

            response.on('error', err => {
                reject(new Error(`Response error: ${err.name || 'NONE'}`));
            });

            // Begin piping data from the response to the package file
            response.pipe(tmpFile, { end: false });
        });
    }
}

/*
 * Interface to store the values needed to calculate download percentage
 */
export interface IDownloadProgress {
    packageSize: number;
    downloadedBytes: number;
    downloadPercentage: number;
}
