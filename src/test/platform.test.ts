/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from 'assert';
import { Runtime, getFallbackRuntimes, getRuntimeDisplayName } from '../platform';

describe('platform tests', () => {
        it('GetFallbackRuntimes handles all runtimes properly', async () => {
                Object.keys(Runtime).forEach(runtime => {
                        if (runtime === Runtime.Unknown) {
                                assert.throws(() => { getFallbackRuntimes(Runtime.Unknown); }, 'Exception should be thrown when getFallbackRuntimes is called for unknown runtime.');
                        } else {
                                assert.doesNotThrow(() => { getFallbackRuntimes(<Runtime>runtime); }, `getFallbackRuntimes function is not able to handle runtime: ${runtime}.`);
                        }
                });
        });

        it('getRuntimeDisplayName handles all runtimes properly', async () => {
                Object.keys(Runtime).forEach(runtime => {
                        if (runtime === Runtime.Unknown) {
                                assert.throws(() => { getRuntimeDisplayName(Runtime.Unknown); }, 'Exception should be thrown when getRuntimeDisplayName is called for unknown runtime.');
                        } else {
                                assert.doesNotThrow(() => { getRuntimeDisplayName(<Runtime>runtime); }, `getRuntimeDisplayName function is not able to handle runtime: ${runtime}.`);
                        }
                });
        });
});

