"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
class PlatformNotSupportedError extends Error {
    constructor(message, platform) {
        super(message || PlatformNotSupportedError.message);
        this.platform = platform;
        this.code = 0 /* ERR_PLATFORM_NOT_SUPPORTED */;
    }
}
PlatformNotSupportedError.message = '';
exports.PlatformNotSupportedError = PlatformNotSupportedError;
class ArchitectureNotSupportedError extends PlatformNotSupportedError {
    constructor(message, platform, architecture) {
        super(message || ArchitectureNotSupportedError.message, platform);
        this.architecture = architecture;
        this.code = 2 /* ERR_ARCHITECTURE_NOT_SUPPORTED */;
    }
}
ArchitectureNotSupportedError.message = '';
exports.ArchitectureNotSupportedError = ArchitectureNotSupportedError;
class DistributionNotSupportedError extends PlatformNotSupportedError {
    constructor(message, platform, distribution) {
        super(message || DistributionNotSupportedError.message, platform);
        this.distribution = distribution;
        this.code = 1 /* ERR_DISTRIBUTION_NOT_SUPPORTED */;
    }
}
DistributionNotSupportedError.message = '';
exports.DistributionNotSupportedError = DistributionNotSupportedError;
//# sourceMappingURL=errors.js.map