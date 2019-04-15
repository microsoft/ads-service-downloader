"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const os = require("os");
const cp = require("child_process");
const fs = require("fs");
const errors_1 = require("./errors");
const unknown = 'unknown';
function getRuntimeIdLinux(distributionName, distributionVersion) {
    switch (distributionName) {
        case 'ubuntu':
            if (distributionVersion.startsWith('14')) {
                // This also works for Linux Mint
                return Runtime.Ubuntu_14;
            }
            else if (distributionVersion.startsWith('16')) {
                return Runtime.Ubuntu_16;
            }
            break;
        case 'elementary':
        case 'elementary OS':
            if (distributionVersion.startsWith('0.3')) {
                // Elementary OS 0.3 Freya is binary compatible with Ubuntu 14.04
                return Runtime.Ubuntu_14;
            }
            else if (distributionVersion.startsWith('0.4')) {
                // Elementary OS 0.4 Loki is binary compatible with Ubuntu 16.04
                return Runtime.Ubuntu_16;
            }
            break;
        case 'linuxmint':
            // Current versions of Linux Mint are binary compatible with Ubuntu 16.04
            return Runtime.Ubuntu_16;
        case 'centos':
        case 'ol':
            // Oracle Linux is binary compatible with CentOS
            return Runtime.CentOS_7;
        case 'fedora':
            return Runtime.Fedora_23;
        case 'opensuse':
            return Runtime.OpenSUSE_13_2;
        case 'sles':
            return Runtime.SLES_12_2;
        case 'rhel':
            return Runtime.RHEL_7;
        case 'debian':
            return Runtime.Debian_8;
        case 'galliumos':
            if (distributionVersion.startsWith('2.0')) {
                return Runtime.Ubuntu_16;
            }
            break;
        default:
            // Default to Ubuntu_16 to try to support other Linux distributions
            return Runtime.Ubuntu_16;
    }
    return Runtime.Ubuntu_16;
}
/**
 * Returns a supported .NET Core Runtime ID (RID) for the current platform. The list of Runtime IDs
 * is available at https://github.com/dotnet/corefx/tree/master/pkg/Microsoft.NETCore.Platforms.
 */
function getRuntimeId(platform, architecture, distribution) {
    switch (platform) {
        case 'win32':
            switch (architecture) {
                case 'x86': return Runtime.Windows_86;
                case 'x86_64': return Runtime.Windows_64;
                default:
            }
            throw new errors_1.ArchitectureNotSupportedError(`Unsupported Windows architecture: ${architecture}`, platform, architecture);
        case 'darwin':
            if (architecture === 'x86_64') {
                // Note: We return the El Capitan RID for Sierra
                return Runtime.OSX;
            }
            throw new errors_1.ArchitectureNotSupportedError(`Unsupported macOS architecture: ${architecture}`, platform, architecture);
        case 'linux':
            if (architecture === 'x86_64') {
                // First try the distribution name
                let runtimeId = getRuntimeIdLinux(distribution.name, distribution.version);
                // If the distribution isn't one that we understand, but the 'ID_LIKE' field has something that we understand, use that
                //
                // NOTE: 'ID_LIKE' doesn't specify the version of the 'like' OS. So we will use the 'VERSION_ID' value. This will restrict
                // how useful ID_LIKE will be since it requires the version numbers to match up, but it is the best we can do.
                if (runtimeId === Runtime.Unknown && distribution.idLike && distribution.idLike.length > 0) {
                    for (let id of distribution.idLike) {
                        runtimeId = getRuntimeIdLinux(id, distribution.version);
                        if (runtimeId !== Runtime.Unknown) {
                            break;
                        }
                    }
                }
                if (runtimeId !== Runtime.Unknown && runtimeId !== Runtime.Unknown) {
                    return runtimeId;
                }
            }
            // If we got here, this is not a Linux distro or architecture that we currently support.
            throw new errors_1.DistributionNotSupportedError(`Unsupported Linux distro: ${distribution.name}, ${distribution.version}, ${architecture}`, platform, distribution.name);
        default:
            // If we got here, we've ended up with a platform we don't support  like 'freebsd' or 'sunos'.
            // Chances are, VS Code doesn't support these platforms either.
            throw new errors_1.PlatformNotSupportedError(undefined, platform);
    }
}
exports.getRuntimeId = getRuntimeId;
var Runtime;
(function (Runtime) {
    Runtime[Runtime["Unknown"] = 'Unknown'] = "Unknown";
    Runtime[Runtime["Windows_86"] = 'Windows_86'] = "Windows_86";
    Runtime[Runtime["Windows_64"] = 'Windows_64'] = "Windows_64";
    Runtime[Runtime["OSX"] = 'OSX'] = "OSX";
    Runtime[Runtime["CentOS_7"] = 'CentOS_7'] = "CentOS_7";
    Runtime[Runtime["Debian_8"] = 'Debian_8'] = "Debian_8";
    Runtime[Runtime["Fedora_23"] = 'Fedora_23'] = "Fedora_23";
    Runtime[Runtime["OpenSUSE_13_2"] = 'OpenSUSE_13_2'] = "OpenSUSE_13_2";
    Runtime[Runtime["SLES_12_2"] = 'SLES_12_2'] = "SLES_12_2";
    Runtime[Runtime["RHEL_7"] = 'RHEL_7'] = "RHEL_7";
    Runtime[Runtime["Ubuntu_14"] = 'Ubuntu_14'] = "Ubuntu_14";
    Runtime[Runtime["Ubuntu_16"] = 'Ubuntu_16'] = "Ubuntu_16";
    Runtime[Runtime["Linux_64"] = 'Linux_64'] = "Linux_64";
    Runtime[Runtime["Linux_86"] = 'Linux-86'] = "Linux_86";
})(Runtime = exports.Runtime || (exports.Runtime = {}));
function getRuntimeDisplayName(runtime) {
    switch (runtime) {
        case Runtime.Windows_64:
            return 'Windows';
        case Runtime.Windows_86:
            return 'Windows';
        case Runtime.OSX:
            return 'OSX';
        case Runtime.CentOS_7:
            return 'Linux';
        case Runtime.Debian_8:
            return 'Linux';
        case Runtime.Fedora_23:
            return 'Linux';
        case Runtime.OpenSUSE_13_2:
            return 'Linux';
        case Runtime.SLES_12_2:
            return 'Linux';
        case Runtime.RHEL_7:
            return 'Linux';
        case Runtime.Ubuntu_14:
            return 'Linux';
        case Runtime.Ubuntu_16:
            return 'Linux';
        case Runtime.Linux_64:
            return 'Linux';
        case Runtime.Linux_86:
            return 'Linux';
        default:
            return 'Unknown';
    }
}
exports.getRuntimeDisplayName = getRuntimeDisplayName;
class PlatformInformation {
    constructor(platform, architecture, distribution = undefined) {
        this.platform = platform;
        this.architecture = architecture;
        this.distribution = distribution;
        try {
            this.runtimeId = getRuntimeId(platform, architecture, distribution);
        }
        catch (err) {
            this.runtimeId = undefined;
        }
    }
    get isWindows() {
        return this.platform === 'win32';
    }
    get isMacOS() {
        return this.platform === 'darwin';
    }
    get isLinux() {
        return this.platform === 'linux';
    }
    get isValidRuntime() {
        return this.runtimeId !== undefined && this.runtimeId !== Runtime.Unknown && this.runtimeId !== Runtime.Unknown;
    }
    get runtimeDisplayName() {
        return getRuntimeDisplayName(this.runtimeId);
    }
    toString() {
        let result = this.platform;
        if (this.architecture) {
            if (result) {
                result += ', ';
            }
            result += this.architecture;
        }
        if (this.distribution) {
            if (result) {
                result += ', ';
            }
            result += this.distribution.toString();
        }
        return result;
    }
    static getCurrent() {
        let platform = os.platform();
        let architecturePromise;
        let distributionPromise;
        switch (platform) {
            case 'win32':
                architecturePromise = PlatformInformation.getWindowsArchitecture();
                distributionPromise = Promise.resolve(undefined);
                break;
            case 'darwin':
                architecturePromise = PlatformInformation.getUnixArchitecture();
                distributionPromise = Promise.resolve(undefined);
                break;
            case 'linux':
                architecturePromise = PlatformInformation.getUnixArchitecture();
                distributionPromise = LinuxDistribution.getCurrent();
                break;
            default:
                return Promise.reject(new errors_1.PlatformNotSupportedError(`Unsupported platform: ${platform}`, platform));
        }
        return Promise.all([architecturePromise, distributionPromise]).then(rt => {
            return new PlatformInformation(platform, rt[0], rt[1]);
        });
    }
    static getWindowsArchitecture() {
        return new Promise((resolve, reject) => {
            // try to get the architecture from WMIC
            PlatformInformation.getWindowsArchitectureWmic().then(architecture => {
                if (architecture && architecture !== unknown) {
                    resolve(architecture);
                }
                else {
                    // sometimes WMIC isn't available on the path so then try to parse the envvar
                    PlatformInformation.getWindowsArchitectureEnv().then(architecture => {
                        resolve(architecture);
                    });
                }
            });
        });
    }
    static getWindowsArchitectureWmic() {
        return this.execChildProcess('wmic os get osarchitecture')
            .then(architecture => {
            if (architecture) {
                let archArray = architecture.split(os.EOL);
                if (archArray.length >= 2) {
                    let arch = archArray[1].trim();
                    // Note: This string can be localized. So, we'll just check to see if it contains 32 or 64.
                    if (arch.indexOf('64') >= 0) {
                        return 'x86_64';
                    }
                    else if (arch.indexOf('32') >= 0) {
                        return 'x86';
                    }
                }
            }
            return unknown;
        }).catch((error) => {
            return unknown;
        });
    }
    static getWindowsArchitectureEnv() {
        return new Promise((resolve, reject) => {
            if (process.env.PROCESSOR_ARCHITECTURE === 'x86' && process.env.PROCESSOR_ARCHITEW6432 === undefined) {
                resolve('x86');
            }
            else {
                resolve('x86_64');
            }
        });
    }
    static getUnixArchitecture() {
        return this.execChildProcess('uname -m')
            .then(architecture => {
            if (architecture) {
                return architecture.trim();
            }
            return undefined;
        });
    }
    static execChildProcess(process) {
        return new Promise((resolve, reject) => {
            cp.exec(process, { maxBuffer: 500 * 1024 }, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                    return;
                }
                if (stderr && stderr.length > 0) {
                    reject(new Error(stderr));
                    return;
                }
                resolve(stdout);
            });
        });
    }
}
exports.PlatformInformation = PlatformInformation;
/**
 * There is no standard way on Linux to find the distribution name and version.
 * Recently, systemd has pushed to standardize the os-release file. This has
 * seen adoption in "recent" versions of all major distributions.
 * https://www.freedesktop.org/software/systemd/man/os-release.html
 */
class LinuxDistribution {
    constructor(name, version, idLike) {
        this.name = name;
        this.version = version;
        this.idLike = idLike;
    }
    static getCurrent() {
        // Try /etc/os-release and fallback to /usr/lib/os-release per the synopsis
        // at https://www.freedesktop.org/software/systemd/man/os-release.html.
        return LinuxDistribution.fromFilePath('/etc/os-release')
            .catch(() => LinuxDistribution.fromFilePath('/usr/lib/os-release'))
            .catch(() => Promise.resolve(new LinuxDistribution(unknown, unknown)));
    }
    toString() {
        return `name=${this.name}, version=${this.version}`;
    }
    static fromFilePath(filePath) {
        return new Promise((resolve, reject) => {
            fs.readFile(filePath, 'utf8', (error, data) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(LinuxDistribution.fromReleaseInfo(data));
                }
            });
        });
    }
    static fromReleaseInfo(releaseInfo, eol = os.EOL) {
        let name = unknown;
        let version = unknown;
        let idLike = undefined;
        const lines = releaseInfo.split(eol);
        for (let line of lines) {
            line = line.trim();
            let equalsIndex = line.indexOf('=');
            if (equalsIndex >= 0) {
                let key = line.substring(0, equalsIndex);
                let value = line.substring(equalsIndex + 1);
                // Strip quotes if necessary
                if (value.length > 1 && value.startsWith('"') && value.endsWith('"')) {
                    value = value.substring(1, value.length - 1);
                }
                else if (value.length > 1 && value.startsWith('\'') && value.endsWith('\'')) {
                    value = value.substring(1, value.length - 1);
                }
                if (key === 'ID') {
                    name = value;
                }
                else if (key === 'VERSION_ID') {
                    version = value;
                }
                else if (key === 'ID_LIKE') {
                    idLike = value.split(' ');
                }
                if (name !== unknown && version !== unknown && idLike !== undefined) {
                    break;
                }
            }
        }
        return new LinuxDistribution(name, version, idLike);
    }
}
exports.LinuxDistribution = LinuxDistribution;
//# sourceMappingURL=platform.js.map