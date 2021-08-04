/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as tar from 'tar';
import { EventEmitter2 as EventEmitter } from 'eventemitter2';
import { Events } from './interfaces';
import { Unzipper } from './zip';

/**
 * Helper class to handle extracting the contents of an archive
 */
export class ArchiveExtractor {

    public readonly eventEmitter = new EventEmitter({ wildcard: true });
    private unzipper = new Unzipper();

    public extract(archivePath: string, targetPath: string): Promise<void> {
        console.log(archivePath);
        if (archivePath.match(/\.tar\.gz|\.tar|\.gz$/i)) {
            let entryCount = 0;
            return tar.x(
                {
                    file: archivePath,
                    cwd: targetPath,
                    // Currently just output -1 as total entries as that value isn't easily available using tar without extra work
                    onentry: (entry: tar.ReadEntry) => this.eventEmitter.emit(Events.ENTRY_EXTRACTED, entry.path, ++entryCount, -1)
                }
            );
        } else {
            // Default to zip extracting if it's not a tarball
            return this.unzipper.extract(archivePath, targetPath);
        }
    }

}

