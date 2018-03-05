/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs");
const serviceDownloadProvider_1 = require("./serviceDownloadProvider");
/*
* Service Provider class finds the SQL tools service executable file or downloads it if doesn't exist.
*/
class ServerProvider {
    constructor(config, logger) {
        this.config = config;
        this.logger = logger;
        this._downloadProvider = new serviceDownloadProvider_1.default(this.config, this.logger);
    }
    /**
     * Public get method for downloadProvider
     */
    get downloadProvider() {
        return this._downloadProvider;
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
    getOrDownloadServer(runtime) {
        // Attempt to find launch file path first from options, and then from the default install location.
        // If SQL tools service can't be found, download it.
        return this.getServerPath(runtime).then(result => {
            if (result === undefined) {
                return this.downloadServerFiles(runtime).then(downloadResult => {
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
    getServerPath(runtime) {
        const installDirectory = this._downloadProvider.getInstallDirectory(runtime);
        return this.findServerPath(installDirectory);
    }
    /**
     * Downloads the service and returns the path of the installed service
     */
    downloadServerFiles(runtime) {
        const installDirectory = this._downloadProvider.getInstallDirectory(runtime);
        return this._downloadProvider.installService(runtime).then(_ => {
            return this.findServerPath(installDirectory);
        });
    }
}
exports.default = ServerProvider;
//# sourceMappingURL=serverProvider.js.map