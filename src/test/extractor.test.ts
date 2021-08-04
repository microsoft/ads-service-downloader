/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import * as tmp from 'tmp';
import * as rimraf from 'rimraf';
import { ArchiveExtractor } from '../extractor';
import { promisify } from 'util';

const rmdir = promisify(rimraf);
const exists = promisify(fs.exists);

describe('ArchiveExtractor', () => {

        let extractionRootDir: string;
        let extractionDir: string;

        const extractor = new ArchiveExtractor();

        beforeEach(() => {
                // Create temp folder to store extracted archive files
                extractionRootDir = tmp.dirSync({ prefix: 'ExtractionTest-' }).name;
                extractionDir = path.join(extractionRootDir, 'ExtractionTest');
        });

        afterEach( async () => {
                // Clean up extracted archive files
                await rmdir(extractionRootDir);
        });

        it('can extract zip', async () => {
                await testExtract('ExtractionTest.zip');
        });

        it('can extract tar', async () => {
                await testExtract('ExtractionTest.tar');
        });

        it('can extract tar.gz', async () => {
                await testExtract('ExtractionTest.tar.gz');
        });

        async function testExtract(filename: string): Promise<void> {
                await extractor.extract(
                        path.resolve(path.join(__dirname, '..', '..', 'src', 'test', 'data', filename)),
                        extractionRootDir);
                await verifyContents();
        }

        async function verifyContents(): Promise<void> {
                assert(await exists(path.join(extractionRootDir, 'ExtractionTest')), 'Archive was not extracted.');
                assert(await exists(path.join(extractionDir, 'Root.txt')), 'Root text file was not extracted');
                assert(await exists(path.join(extractionDir, 'Folder')), 'Root folder was not extracted.');
                assert(await exists(path.join(extractionDir, 'Folder', 'FolderDoc.txt')), 'Sub-File was not extracted');
        }
});

