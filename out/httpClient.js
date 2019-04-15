"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const https = require("https");
const http = require("http");
const fs = require("fs");
const url_1 = require("url");
const eventemitter2_1 = require("eventemitter2");
const proxy_1 = require("./proxy");
/*
 * Http client class to handle downloading files using http or https urls
 */
class HttpClient {
    constructor() {
        this.eventEmitter = new eventemitter2_1.EventEmitter2({ wildcard: true });
    }
    /*
     * Downloads a file and stores the result in the temp file inside the package object
     */
    downloadFile(urlString, pkg, proxy, strictSSL) {
        const url = url_1.parse(urlString);
        let options = this.getHttpClientOptions(url, proxy, strictSSL);
        let clientRequest = url.protocol === 'http:' ? http.request : https.request;
        return new Promise((resolve, reject) => {
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
    getHttpClientOptions(url, proxy, strictSSL) {
        const agent = proxy_1.getProxyAgent(url, proxy, strictSSL);
        let options = {
            host: url.hostname,
            path: url.path,
            agent: agent,
            port: +url.port
        };
        if (url.protocol === 'https:') {
            let httpsOptions = {
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
    handleDataReceivedEvent(progress, data) {
        progress.downloadedBytes += data.length;
        // Update status bar item with percentage
        if (progress.packageSize > 0) {
            let newPercentage = Math.ceil(100 * (progress.downloadedBytes / progress.packageSize));
            if (newPercentage !== progress.downloadPercentage) {
                this.eventEmitter.emit("download_progress" /* DOWNLOAD_PROGRESS */, newPercentage);
                progress.downloadPercentage = newPercentage;
            }
        }
        return;
    }
    handleSuccessfulResponse(pkg, response) {
        return new Promise((resolve, reject) => {
            let progress = {
                packageSize: parseInt(response.headers['content-length'], 10),
                downloadedBytes: 0,
                downloadPercentage: 0
            };
            this.eventEmitter.emit("download_start" /* DOWNLOAD_START */, pkg.url, progress.packageSize);
            response.on('data', data => {
                this.handleDataReceivedEvent(progress, data);
            });
            let tmpFile = fs.createWriteStream(undefined, { fd: pkg.tmpFile.fd });
            response.on('end', () => {
                this.eventEmitter.emit("download_end" /* DOWNLOAD_END */);
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
exports.HttpClient = HttpClient;
//# sourceMappingURL=httpClient.js.map