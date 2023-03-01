/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as os from 'os';
import * as cp from 'child_process';
import * as fs from 'fs';
import { PlatformNotSupportedError, ArchitectureNotSupportedError, DistributionNotSupportedError } from './errors';
import { ConsoleLogger, ILogger } from './logger';

const unknown = 'unknown';
const AZDATA_RUNTIME_ENVVAR = 'AZDATA_RUNTIME';

export enum Runtime {
    Unknown = 'Unknown',
    // Windows
    Windows_86 = 'Windows_86',
    Windows_64 = 'Windows_64',
    Windows_ARM64 = "Windows_ARM64",
    Windows = 'Windows',
    // macOS
    OSX = 'OSX',
    OSX_ARM64 = 'OSX_ARM64',
    // Linux distributions
    CentOS = 'CentOS',
    Debian = 'Debian',
    ElementaryOS_0_3 = 'ElementaryOS_0_3',
    ElementaryOS_0_4 = 'ElementaryOS_0_4',
    ElementaryOS = 'ElementaryOS',
    Fedora = 'Fedora',
    GalliumOS = 'GalliumOS',
    LinuxMint = 'LinuxMint',
    OpenSUSE = 'OpenSUSE',
    OracleLinux = 'OracleLinux',
    RHEL = 'RHEL',
    SLES = 'SLES',
    Ubuntu_14 = 'Ubuntu_14',
    Ubuntu_16 = 'Ubuntu_16',
    Ubuntu_18 = 'Ubuntu_18',
    Ubuntu_20 = 'Ubuntu_20',
    Ubuntu_22 = 'Ubuntu_22',
    Ubuntu = 'Ubuntu',
    Linux = 'Linux'
}

/**
 * There is no standard way on Linux to find the distribution name and version.
 * Recently, systemd has pushed to standardize the os-release file. This has
 * seen adoption in "recent" versions of all major distributions.
 * https://www.freedesktop.org/software/systemd/man/os-release.html
 */
export class LinuxDistribution {
    public constructor(
        public name: string,
        public version: string,
        public idLike?: string[]) { }

    public static getCurrent(): Promise<LinuxDistribution> {
        // Try /etc/os-release and fallback to /usr/lib/os-release per the synopsis
        // at https://www.freedesktop.org/software/systemd/man/os-release.html.
        return LinuxDistribution.fromFilePath('/etc/os-release')
            .catch(() => LinuxDistribution.fromFilePath('/usr/lib/os-release'))
            .catch(() => Promise.resolve(new LinuxDistribution(unknown, unknown)));
    }

    public toString(): string {
        return `name=${this.name}, version=${this.version}`;
    }

    private static fromFilePath(filePath: string): Promise<LinuxDistribution> {
        return new Promise<LinuxDistribution>((resolve, reject) => {
            fs.readFile(filePath, 'utf8', (error, data) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(LinuxDistribution.fromReleaseInfo(data));
                }
            });
        });
    }

    public static fromReleaseInfo(releaseInfo: string, eol: string = os.EOL): LinuxDistribution {
        let name = unknown;
        let version = unknown;
        let idLike: string[] = undefined;

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
                } else if (value.length > 1 && value.startsWith('\'') && value.endsWith('\'')) {
                    value = value.substring(1, value.length - 1);
                }

                if (key === 'ID') {
                    name = value;
                } else if (key === 'VERSION_ID') {
                    version = value;
                } else if (key === 'ID_LIKE') {
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

function getRuntimeIdLinux(distributionName: string, distributionVersion: string, logger: ILogger): Runtime {
    switch (distributionName) {
        case 'ubuntu':
            if (distributionVersion.startsWith('14')) {
                return Runtime.Ubuntu_14;
            } else if (distributionVersion.startsWith('16')) {
                return Runtime.Ubuntu_16;
            } else if (distributionVersion.startsWith('18')) {
                return Runtime.Ubuntu_18;
            } else if (distributionVersion.startsWith('20')) {
                return Runtime.Ubuntu_20;
            } else if (distributionVersion.startsWith('22')) {
                return Runtime.Ubuntu_22;
            } else {
                logger.warn(`The Ubuntu version '${distributionVersion}' is unknown to the service downloader, it will be treated as Ubuntu.`);
                return Runtime.Ubuntu;
            }
        case 'elementary':
        case 'elementary OS':
            if (distributionVersion.startsWith('0.3')) {
                return Runtime.ElementaryOS_0_3;
            } else if (distributionVersion.startsWith('0.4')) {
                return Runtime.ElementaryOS_0_4;
            } else {
                logger.warn(`The ElementaryOS version '${distributionVersion}' is unknown to the service downloader, it will be treated as ElementaryOS.`);
                return Runtime.ElementaryOS;
            }
        case 'linuxmint':
            return Runtime.LinuxMint;
        case 'centos':
            return Runtime.CentOS;
        case 'ol':
            return Runtime.OracleLinux;
        case 'fedora':
            return Runtime.Fedora;
        case 'opensuse':
            return Runtime.OpenSUSE;
        case 'sles':
            return Runtime.SLES;
        case 'rhel':
            return Runtime.RHEL;
        case 'debian':
            return Runtime.Debian;
        case 'galliumos':
            return Runtime.GalliumOS;
        default:
            logger.warn(`Unknown distribution name: ${distributionName}`);
            return Runtime.Linux;
    }
}

/**
 * Returns a supported .NET Core Runtime ID (RID) for the current platform. The list of Runtime IDs
 * is available at https://github.com/dotnet/corefx/tree/master/pkg/Microsoft.NETCore.Platforms.
 */
export function getRuntimeId(platform: string, architecture: string, distribution: LinuxDistribution, logger: ILogger): Runtime {
    // In the build pipeline, we need the capability to produce builds for runtimes that is different
    // from the current OS. e.g. produce ARM64 builds on x64 machines.
    // In order to achieve this, the AZDATA_RUNTIME environment variable is used to override the current runtime information.
    const runtimeOverride = process.env[AZDATA_RUNTIME_ENVVAR];
    if (runtimeOverride) {
        logger.verbose(`AZDATA_RUNTIME environment variable is set, the value '${runtimeOverride}' will be used as the runtime.`);
        return <Runtime>runtimeOverride;
    }
    switch (platform) {
        case 'win32':
            switch (architecture) {
                case 'x86': return Runtime.Windows_86;
                case 'x86_64': return Runtime.Windows_64;
                case 'arm64': return Runtime.Windows_ARM64;
                default:
                    throw new ArchitectureNotSupportedError(platform, architecture);
            }
        case 'darwin':
            switch (architecture) {
                case 'x86_64': return Runtime.OSX;
                case 'arm64': return Runtime.OSX_ARM64;
                default:
                    throw new ArchitectureNotSupportedError(platform, architecture);
            }

        case 'linux':
            if (architecture === 'x86_64') {

                // First try the distribution name
                let runtimeId = getRuntimeIdLinux(distribution.name, distribution.version, logger);

                // If the distribution isn't one that we understand, but the 'ID_LIKE' field has something that we understand, use that
                //
                // NOTE: 'ID_LIKE' doesn't specify the version of the 'like' OS. So we will use the 'VERSION_ID' value. This will restrict
                // how useful ID_LIKE will be since it requires the version numbers to match up, but it is the best we can do.
                if (runtimeId === Runtime.Unknown && distribution.idLike && distribution.idLike.length > 0) {
                    for (let id of distribution.idLike) {
                        runtimeId = getRuntimeIdLinux(id, distribution.version, logger);
                        if (runtimeId !== Runtime.Unknown) {
                            break;
                        }
                    }
                }

                if (runtimeId !== Runtime.Unknown) {
                    return runtimeId;
                }
            }

            // If we got here, this is not a Linux distro or architecture that we currently support.
            throw new DistributionNotSupportedError(platform, distribution.name, distribution.version);
        default:
            // If we got here, we've ended up with a platform we don't support  like 'freebsd' or 'sunos'.
            // Chances are, VS Code doesn't support these platforms either.
            throw new PlatformNotSupportedError(platform);
    }
}

export function getRuntimeDisplayName(runtime: Runtime): string {
    switch (runtime) {
        case Runtime.Windows_64:
        case Runtime.Windows_86:
        case Runtime.Windows_ARM64:
        case Runtime.Windows:
            return 'Windows';
        case Runtime.OSX:
        case Runtime.OSX_ARM64:
            return 'OSX';
        case Runtime.CentOS:
        case Runtime.Debian:
        case Runtime.ElementaryOS_0_3:
        case Runtime.ElementaryOS_0_4:
        case Runtime.ElementaryOS:
        case Runtime.Fedora:
        case Runtime.GalliumOS:
        case Runtime.LinuxMint:
        case Runtime.OpenSUSE:
        case Runtime.OracleLinux:
        case Runtime.SLES:
        case Runtime.RHEL:
        case Runtime.Ubuntu_14:
        case Runtime.Ubuntu_16:
        case Runtime.Ubuntu_18:
        case Runtime.Ubuntu_20:
        case Runtime.Ubuntu_22:
        case Runtime.Ubuntu:
        case Runtime.Linux:
            return 'Linux';
        default:
            throw new PlatformNotSupportedError(runtime);
    }
}

/**
 * Get a list of runtimes that can be used when the given runtime is not available.
 * The fallback runtimes are ordered from more specific to more general. e.g. Ubuntu_16 -> Ubuntu -> Linux.
 */
export function getFallbackRuntimes(runtime: Runtime): Runtime[] {
    switch (runtime) {
        case Runtime.Windows_64:
        case Runtime.Windows_86:
        case Runtime.Windows_ARM64:
            return [Runtime.Windows];
        case Runtime.OSX_ARM64:
            return [Runtime.OSX];
        case Runtime.ElementaryOS_0_3:
            // Elementary OS 0.3 Freya is binary compatible with Ubuntu 14.04
            return [Runtime.Ubuntu_14, ...getFallbackRuntimes(Runtime.Ubuntu_14)];
        case Runtime.ElementaryOS_0_4:
            // Elementary OS 0.4 Loki is binary compatible with Ubuntu 16.04
            return [Runtime.Ubuntu_16, ...getFallbackRuntimes(Runtime.Ubuntu_16)];
        case Runtime.ElementaryOS:
            return [Runtime.Linux];
        case Runtime.GalliumOS:
            return [Runtime.Ubuntu_16, ...getFallbackRuntimes(Runtime.Ubuntu_16)];
        case Runtime.LinuxMint:
            // Current versions of Linux Mint are binary compatible with Ubuntu 16.04
            return [Runtime.Ubuntu_16, ...getFallbackRuntimes(Runtime.Ubuntu_16)];
        case Runtime.OracleLinux:
            // Oracle Linux is binary compatible with CentOS
            return [Runtime.CentOS, ...getFallbackRuntimes(Runtime.CentOS)];
        case Runtime.CentOS:
        case Runtime.Debian:
        case Runtime.Fedora:
        case Runtime.OpenSUSE:
        case Runtime.RHEL:
        case Runtime.SLES:
            return [Runtime.Linux];
        case Runtime.Ubuntu_22:
        case Runtime.Ubuntu_20:
        case Runtime.Ubuntu_18:
        case Runtime.Ubuntu_16:
        case Runtime.Ubuntu_14:
            return [Runtime.Ubuntu, ...getFallbackRuntimes(Runtime.Ubuntu)];
        case Runtime.Ubuntu:
            return [Runtime.Linux];
        case Runtime.Windows:
        case Runtime.OSX:
        case Runtime.Linux:
            return [];
        default:
            throw new PlatformNotSupportedError(runtime);
    }
}

export class PlatformInformation {
    public runtimeId: Runtime;

    public constructor(
        logger: ILogger,
        public platform: string,
        public architecture: string,
        public distribution: LinuxDistribution = undefined) {
        try {
            logger.verbose(`Getting runtime information. platform: ${platform}, architecture: ${architecture}, distribution: ${distribution}`);
            this.runtimeId = getRuntimeId(platform, architecture, distribution, logger);
        } catch (err) {
            const message = err && err.message ? err.message : err;
            logger.error(`Failed to get the runtime information. platform: ${platform}, architecture: ${architecture}, distribution: ${distribution}. error message: ${message}`);
            this.runtimeId = undefined;
        }
    }

    public get isWindows(): boolean {
        return this.platform === 'win32';
    }

    public get isMacOS(): boolean {
        return this.platform === 'darwin';
    }

    public get isLinux(): boolean {
        return this.platform === 'linux';
    }

    public get isValidRuntime(): boolean {
        return this.runtimeId !== undefined && this.runtimeId !== Runtime.Unknown;
    }

    public get runtimeDisplayName(): string {
        return getRuntimeDisplayName(this.runtimeId);
    }

    public toString(): string {
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

    public static getCurrent(logger: ILogger = new ConsoleLogger()): Promise<PlatformInformation> {
        let platform = os.platform();
        let architecturePromise: Promise<string>;
        let distributionPromise: Promise<LinuxDistribution>;

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
                return Promise.reject(new PlatformNotSupportedError(platform));
        }

        return Promise.all([architecturePromise, distributionPromise]).then(rt => {
            return new PlatformInformation(logger, platform, rt[0], rt[1]);
        });
    }


    private static getWindowsArchitecture(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            // try to get the architecture from WMIC
            PlatformInformation.getWindowsArchitectureWmic().then(wmiArch => {
                if (wmiArch && wmiArch !== unknown) {
                    resolve(wmiArch);
                } else {
                    // sometimes WMIC isn't available on the path so then try to parse the envvar
                    const envArch = PlatformInformation.getWindowsArchitectureEnv();
                    resolve(envArch);
                }
            });
        });
    }

    private static getWindowsArchitectureWmic(): Promise<string> {
        return this.execChildProcess('wmic os get osarchitecture')
            .then(architecture => {
                if (architecture) {
                    let archArray: string[] = architecture.split(os.EOL);
                    if (archArray.length >= 2) {
                        let arch = archArray[1].trim();
                        // Output of this command on different os architecture:
                        //   ARM: ARM 64-bit Processor
                        //   x64: 64-bit
                        //   x86: 32-bit
                        // To take localization into consideration, we only check for the keywords: ARM, 64 and 32.
                        if (arch.toUpperCase().indexOf('ARM') >= 0) {
                            return 'arm64';
                        } else if (arch.indexOf('64') >= 0) {
                            return 'x86_64';
                        } else if (arch.indexOf('32') >= 0) {
                            return 'x86';
                        }
                    }
                }

                return unknown;
            }).catch((error) => {
                return unknown;
            });
    }

    private static getWindowsArchitectureEnv(): string {
        let arch: string;
        if (process.env.PROCESSOR_ARCHITECTURE === 'ARM64') {
            arch = 'arm64';
        } else if (process.env.PROCESSOR_ARCHITECTURE === 'x86' && process.env.PROCESSOR_ARCHITEW6432 === undefined) {
            arch = 'x86';
        } else {
            arch = 'x86_64';
        }
        return arch;
    }

    private static getUnixArchitecture(): Promise<string> {
        return this.execChildProcess('uname -m')
            .then(architecture => {
                if (architecture) {
                    return architecture.trim();
                }

                return undefined;
            });
    }

    private static execChildProcess(process: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            cp.exec(process, { maxBuffer: 500 * 1024 }, (error: Error, stdout: string, stderr: string) => {
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
