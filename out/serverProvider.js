/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs");
const eventemitter2_1 = require("eventemitter2");
const platform_1 = require("./platform");
const serviceDownloadProvider_1 = require("./serviceDownloadProvider");
/*
* Service Provider class finds the SQL tools service executable file or downloads it if doesn't exist.
*/
class ServerProvider {
    constructor(config) {
        this.config = config;
        this.eventEmitter = new eventemitter2_1.EventEmitter2({ wildcard: true });
        this._downloadProvider = new serviceDownloadProvider_1.ServiceDownloadProvider(this.config);
        this._downloadProvider.eventEmitter.onAny((e, ...args) => {
            this.eventEmitter.emit(e, ...args);
        });
    }
    get runtime() {
        if (!this._runtime) {
            return this.findRuntime().then(r => {
                this._runtime = r;
                return r;
            });
        }
        return Promise.resolve(this._runtime);
    }
    /**
     * Public get method for downloadProvider
     */
    get downloadProvider() {
        return this._downloadProvider;
    }
    findRuntime() {
        return platform_1.PlatformInformation.getCurrent().then(p => {
            return p.runtimeId;
        });
    }
    /**
     * Given a file path, returns the path to the SQL Tools service file.
     */
    findServerPath(filePath, executableFiles = undefined) {
        return new Promise((resolve, reject) => {
            fs.stat(filePath, (er, stats) => {
                // If a file path was passed, assume its the launch file.
                if (stats.isFile()) {
                    resolve(filePath);
                }
                // Otherwise, search the specified folder.
                let candidate;
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
    getOrDownloadServer() {
        // Attempt to find launch file path first from options, and then from the default install location.
        // If SQL tools service can't be found, download it.
        return this.getServerPath().then(result => {
            if (result === undefined) {
                return this.downloadServerFiles().then(downloadResult => {
                    return downloadResult;
                });
            }
            else {
                return result;
            }
        });
    }
    /**
     * Returns the path of the installed service
     */
    getServerPath() {
        return this.runtime.then(r => {
            const installDirectory = this._downloadProvider.getInstallDirectory(r);
            return this.findServerPath(installDirectory);
        });
    }
    /**
     * Downloads the service and returns the path of the installed service
     */
    downloadServerFiles() {
        return this.runtime.then(r => {
            const installDirectory = this._downloadProvider.getInstallDirectory(r);
            return this._downloadProvider.installService(r).then(_ => {
                return this.findServerPath(installDirectory);
            });
        });
    }
}
exports.ServerProvider = ServerProvider;
//# sourceMappingURL=serverProvider.js.map