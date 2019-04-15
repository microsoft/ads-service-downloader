/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const decompress = require("decompress");
const mkdirp = require("mkdirp");
const eventemitter2_1 = require("eventemitter2");
const tmp = require("tmp");
const platform_1 = require("./platform");
const httpClient_1 = require("./httpClient");
const errors_1 = require("./errors");
/*
* Service Download Provider class which handles downloading the service client
*/
class ServiceDownloadProvider {
    constructor(_config) {
        this._config = _config;
        this.httpClient = new httpClient_1.HttpClient();
        this.eventEmitter = new eventemitter2_1.EventEmitter2({ wildcard: true });
        // Ensure our temp files get cleaned up in case of error.
        tmp.setGracefulCleanup();
        this.httpClient.eventEmitter.onAny((e, ...args) => {
            this.eventEmitter.emit(e, ...args);
        });
    }
    /**
     * Returns the download url for given platform
     */
    getDownloadFileName(platform) {
        let fileNamesJson = this._config.downloadFileNames;
        let fileName = fileNamesJson[platform];
        if (fileName === undefined) {
            if (process.platform === 'linux') {
                throw new errors_1.DistributionNotSupportedError('Unsupported linux distribution', process.platform, platform.toString());
            }
            else {
                throw new errors_1.PlatformNotSupportedError(`Unsupported platform: ${process.platform}`, process.platform);
            }
        }
        return fileName;
    }
    /**
     * Returns SQL tools service installed folder.
     */
    getInstallDirectory(platform) {
        let basePath = this._config.installDirectory;
        let versionFromConfig = this._config.version;
        basePath = basePath.replace('{#version#}', versionFromConfig);
        basePath = basePath.replace('{#platform#}', platform_1.getRuntimeDisplayName(platform));
        if (!fs.existsSync(basePath)) {
            mkdirp.sync(basePath);
        }
        return basePath;
    }
    getLocalUserFolderPath(platform) {
        if (platform) {
            switch (platform) {
                case platform_1.Runtime.Windows_64:
                case platform_1.Runtime.Windows_86:
                    return process.env.APPDATA;
                case platform_1.Runtime.OSX:
                    return process.env.HOME + '/Library/Preferences';
                default:
                    return process.env.HOME;
            }
        }
    }
    getGetDownloadUrl(fileName) {
        let baseDownloadUrl = this._config.downloadUrl;
        let version = this._config.version;
        baseDownloadUrl = baseDownloadUrl.replace('{#version#}', version);
        baseDownloadUrl = baseDownloadUrl.replace('{#fileName#}', fileName);
        return baseDownloadUrl;
    }
    /**
     * Downloads the service and decompress it in the install folder.
     */
    installService(platform) {
        const proxy = this._config.proxy;
        const strictSSL = this._config.strictSSL;
        return new Promise((resolve, reject) => {
            const fileName = this.getDownloadFileName(platform);
            const installDirectory = this.getInstallDirectory(platform);
            const urlString = this.getGetDownloadUrl(fileName);
            let pkg = {
                installPath: installDirectory,
                url: urlString,
                tmpFile: undefined
            };
            this.createTempFile(pkg).then(tmpResult => {
                pkg.tmpFile = tmpResult;
                this.httpClient.downloadFile(pkg.url, pkg, proxy, strictSSL).then(_ => {
                    this.install(pkg).then(result => {
                        resolve(true);
                    }).catch(installError => {
                        reject(installError);
                    });
                }).catch(downloadError => {
                    reject(downloadError);
                });
            });
        });
    }
    createTempFile(pkg) {
        return new Promise((resolve, reject) => {
            tmp.file({ prefix: 'package-' }, (err, path, fd, cleanupCallback) => {
                if (err) {
                    return reject(new Error('Error from tmp.file'));
                }
                resolve({ name: path, fd: fd, removeCallback: cleanupCallback });
            });
        });
    }
    install(pkg) {
        this.eventEmitter.emit("install_start" /* INSTALL_START */, pkg.installPath);
        return decompress(pkg.tmpFile.name, pkg.installPath).then(() => {
            this.eventEmitter.emit("install_end" /* INSTALL_END */);
        });
    }
}
exports.ServiceDownloadProvider = ServiceDownloadProvider;
//# sourceMappingURL=serviceDownloadProvider.js.map