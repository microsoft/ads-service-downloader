/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const decompress = require("decompress");
const mkdirp = require("mkdirp");
const platform_1 = require("./platform");
const tmp = require("tmp");
const httpClient_1 = require("./httpClient");
/*
* Service Download Provider class which handles downloading the service client
*/
class ServiceDownloadProvider {
    constructor(_config, _logger) {
        this._config = _config;
        this._logger = _logger;
        this.httpClient = new httpClient_1.default();
        // Ensure our temp files get cleaned up in case of error.
        tmp.setGracefulCleanup();
    }
    /**
     * Returns the download url for given platform
     */
    getDownloadFileName(platform) {
        let fileNamesJson = this._config.downloadFileNames;
        console.info('Platform: ', platform.toString());
        let fileName = fileNamesJson[platform.toString()];
        console.info('Filename: ', fileName);
        if (fileName === undefined) {
            if (process.platform === 'linux') {
                throw new Error('Unsupported linux distribution');
            }
            else {
                throw new Error(`Unsupported platform: ${process.platform}`);
            }
        }
        return fileName;
    }
    /**
     * Returns SQL tools service installed folder.
     */
    getInstallDirectory(platform) {
        let basePath = this.getInstallDirectoryRoot(platform);
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
    /**
     * Returns SQL tools service installed folder root.
     */
    getInstallDirectoryRoot(platform) {
        let installDirFromConfig = this._config.installDirectory;
        if (!installDirFromConfig || installDirFromConfig === '') {
            let rootFolderName = '.sqlops';
            if (platform === platform_1.Runtime.Windows_64 || platform === platform_1.Runtime.Windows_86) {
                rootFolderName = 'sqlops';
            }
            // installDirFromConfig = path.join(this.getLocalUserFolderPath(platform), `/${rootFolderName}/${this._extensionConstants.installFolderName}/{#version#}/{#platform#}`);
        }
        return installDirFromConfig;
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
            // this._logger.appendLine(`${this._extensionConstants.serviceInstallingTo} ${installDirectory}.`);
            const urlString = this.getGetDownloadUrl(fileName);
            // this._logger.appendLine(`${Constants.serviceDownloading} ${urlString}`);
            let pkg = {
                installPath: installDirectory,
                url: urlString,
                tmpFile: undefined
            };
            this.createTempFile(pkg).then(tmpResult => {
                pkg.tmpFile = tmpResult;
                this.httpClient.downloadFile(pkg.url, pkg, this._logger, proxy, strictSSL).then(_ => {
                    // this._logger.logDebug(`Downloaded to ${pkg.tmpFile.name}...`);
                    this._logger.appendLine(' Done!');
                    this.install(pkg).then(result => {
                        resolve(true);
                    }).catch(installError => {
                        reject(installError);
                    });
                }).catch(downloadError => {
                    this._logger.appendLine(`[ERROR] ${downloadError}`);
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
        this._logger.appendLine('Installing ...');
        return decompress(pkg.tmpFile.name, pkg.installPath);
    }
}
exports.default = ServiceDownloadProvider;
//# sourceMappingURL=serviceDownloadProvider.js.map