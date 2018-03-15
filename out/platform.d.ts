/**
 * Returns a supported .NET Core Runtime ID (RID) for the current platform. The list of Runtime IDs
 * is available at https://github.com/dotnet/corefx/tree/master/pkg/Microsoft.NETCore.Platforms.
 */
export declare function getRuntimeId(platform: string, architecture: string, distribution: LinuxDistribution): Runtime;
export declare enum Runtime {
    Unknown,
    Windows_86,
    Windows_64,
    OSX,
    CentOS_7,
    Debian_8,
    Fedora_23,
    OpenSUSE_13_2,
    SLES_12_2,
    RHEL_7,
    Ubuntu_14,
    Ubuntu_16,
    Linux_64,
    Linux_86,
}
export declare function getRuntimeDisplayName(runtime: Runtime): string;
export declare class PlatformInformation {
    platform: string;
    architecture: string;
    distribution: LinuxDistribution;
    runtimeId: Runtime;
    constructor(platform: string, architecture: string, distribution?: LinuxDistribution);
    readonly isWindows: boolean;
    readonly isMacOS: boolean;
    readonly isLinux: boolean;
    readonly isValidRuntime: boolean;
    readonly runtimeDisplayName: string;
    toString(): string;
    static getCurrent(): Promise<PlatformInformation>;
    private static getWindowsArchitecture();
    private static getWindowsArchitectureWmic();
    private static getWindowsArchitectureEnv();
    private static getUnixArchitecture();
    private static execChildProcess(process);
}
/**
 * There is no standard way on Linux to find the distribution name and version.
 * Recently, systemd has pushed to standardize the os-release file. This has
 * seen adoption in "recent" versions of all major distributions.
 * https://www.freedesktop.org/software/systemd/man/os-release.html
 */
export declare class LinuxDistribution {
    name: string;
    version: string;
    idLike: string[];
    constructor(name: string, version: string, idLike?: string[]);
    static getCurrent(): Promise<LinuxDistribution>;
    toString(): string;
    private static fromFilePath(filePath);
    static fromReleaseInfo(releaseInfo: string, eol?: string): LinuxDistribution;
}
