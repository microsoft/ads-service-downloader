import { ErrorCodes } from './interfaces';
export declare class PlatformNotSupportedError extends Error {
    platform: string;
    static readonly message: string;
    readonly code: ErrorCodes;
    constructor(message?: string, platform?: string);
}
export declare class ArchitectureNotSupportedError extends PlatformNotSupportedError {
    architecture: string;
    static readonly message: string;
    readonly code: ErrorCodes;
    constructor(message?: string, platform?: string, architecture?: string);
}
export declare class DistributionNotSupportedError extends PlatformNotSupportedError {
    distribution: string;
    static readonly message: string;
    readonly code: ErrorCodes;
    constructor(message?: string, platform?: string, distribution?: string);
}
