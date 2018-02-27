export declare enum Runtime {
    UnknownRuntime,
    UnknownVersion,
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
