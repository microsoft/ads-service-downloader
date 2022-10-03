/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ErrorCodes } from './interfaces';

export class PlatformNotSupportedError extends Error {
    public readonly code: ErrorCodes = ErrorCodes.ERR_PLATFORM_NOT_SUPPORTED;

    constructor(platform: string) {
        super(`The platform '${platform}' is not supported.`);
    }
}

export class ArchitectureNotSupportedError extends Error {
    public readonly code: ErrorCodes = ErrorCodes.ERR_ARCHITECTURE_NOT_SUPPORTED;

    constructor(platform: string, architecture: string) {
        super(`The architecture '${architecture}' for platform '${platform}' is not supported.`);
    }
}

export class DistributionNotSupportedError extends Error {
    public readonly code: ErrorCodes = ErrorCodes.ERR_DISTRIBUTION_NOT_SUPPORTED;

    constructor(platform: string, distribution: string, version: string) {
        super(`The distribution '${distribution}' with version '${version}' for platform '${platform}' is not supported.`);
    }
}
