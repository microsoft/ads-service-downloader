/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from 'assert';
import { Runtime } from '../platform';
import { ServiceDownloadProvider } from '../serviceDownloadProvider';

describe('ServiceDownloaderProvider tests', () => {
        it('Fallback logic test', async () => {
                const config = {
                        version: '0.1',
                        downloadUrl: '',
                        installDirectory: '',
                        executableFiles: [],
                        proxy: '',
                        strictSSL: false,
                        downloadFileNames: {
                        }
                };
                const provider = new ServiceDownloadProvider(config);

                // scenario: runtime not found test
                assert.throws(() => { provider.getDownloadFileName(Runtime.CentOS); });

                // scenario: runtime is specified
                let mapping = {};
                let runtimesToTest = [Runtime.CentOS, Runtime.Debian, Runtime.ElementaryOS, Runtime.ElementaryOS_0_3, Runtime.ElementaryOS_0_4,
                Runtime.Fedora, Runtime.GalliumOS, Runtime.Linux, Runtime.LinuxMint, Runtime.OpenSUSE, Runtime.OracleLinux, Runtime.RHEL, Runtime.SLES,
                Runtime.Ubuntu, Runtime.Ubuntu_14, Runtime.Ubuntu_16, Runtime.Ubuntu_18, Runtime.Ubuntu_20, Runtime.Ubuntu_22, Runtime.OSX,
                Runtime.OSX_ARM64, Runtime.Windows, Runtime.Windows_64, Runtime.Windows_86];
                runtimesToTest.forEach(runtime => {
                        mapping[runtime] = runtime;
                });
                config.downloadFileNames = mapping;
                runtimesToTest.forEach(runtime => {
                        assert.equal(provider.getDownloadFileName(runtime), runtime);
                });

                // Windows test - fallback to Windows
                mapping = {};
                mapping[Runtime.Windows] = Runtime.Windows;
                config.downloadFileNames = mapping;
                runtimesToTest = [Runtime.Windows, Runtime.Windows_64, Runtime.Windows_86];
                runtimesToTest.forEach(runtime => {
                        assert.equal(provider.getDownloadFileName(runtime), Runtime.Windows);
                });

                // OSX test - fallback to OSX
                mapping = {};
                mapping[Runtime.OSX] = Runtime.OSX;
                config.downloadFileNames = mapping;
                runtimesToTest = [Runtime.OSX, Runtime.OSX_ARM64];
                runtimesToTest.forEach(runtime => {
                        assert.equal(provider.getDownloadFileName(runtime), Runtime.OSX);
                });

                // Linux test
                // scenario: fallback to Linux
                mapping = {};
                mapping[Runtime.Linux] = Runtime.Linux;
                runtimesToTest = [Runtime.CentOS, Runtime.Debian, Runtime.ElementaryOS, Runtime.ElementaryOS_0_3, Runtime.ElementaryOS_0_4, Runtime.Fedora,
                Runtime.GalliumOS, Runtime.Linux, Runtime.LinuxMint, Runtime.OpenSUSE, Runtime.OracleLinux, Runtime.RHEL, Runtime.SLES, Runtime.Ubuntu,
                Runtime.Ubuntu_14, Runtime.Ubuntu_16, Runtime.Ubuntu_18, Runtime.Ubuntu_20, Runtime.Ubuntu_22];
                config.downloadFileNames = mapping;
                runtimesToTest.forEach(runtime => {
                        assert.equal(provider.getDownloadFileName(runtime), Runtime.Linux);
                });

                // scenario: fallback to Ubuntu
                mapping = {};
                mapping[Runtime.Ubuntu] = Runtime.Ubuntu;
                mapping[Runtime.Linux] = Runtime.Linux;
                config.downloadFileNames = mapping;
                runtimesToTest = [Runtime.Ubuntu, Runtime.Ubuntu_14, Runtime.Ubuntu_16, Runtime.Ubuntu_18, Runtime.Ubuntu_20, Runtime.Ubuntu_22,
                Runtime.ElementaryOS_0_3, Runtime.ElementaryOS_0_4, Runtime.GalliumOS, Runtime.LinuxMint];
                runtimesToTest.forEach(runtime => {
                        assert.equal(provider.getDownloadFileName(runtime), Runtime.Ubuntu);
                });

                // scenario: fallback to Ubuntu 16
                mapping = {};
                mapping[Runtime.Ubuntu_16] = Runtime.Ubuntu_16;
                mapping[Runtime.Ubuntu] = Runtime.Ubuntu;
                mapping[Runtime.Linux] = Runtime.Linux;
                config.downloadFileNames = mapping;
                runtimesToTest = [Runtime.Ubuntu_16, Runtime.ElementaryOS_0_4, Runtime.GalliumOS, Runtime.LinuxMint];
                runtimesToTest.forEach(runtime => {
                        assert.equal(provider.getDownloadFileName(runtime), Runtime.Ubuntu_16);
                });

                // scenario: fallback to Ubuntu 14
                mapping = {};
                mapping[Runtime.Ubuntu_14] = Runtime.Ubuntu_14;
                mapping[Runtime.Ubuntu] = Runtime.Ubuntu;
                mapping[Runtime.Linux] = Runtime.Linux;
                config.downloadFileNames = mapping;
                runtimesToTest = [Runtime.Ubuntu_14, Runtime.ElementaryOS_0_3];
                runtimesToTest.forEach(runtime => {
                        assert.equal(provider.getDownloadFileName(runtime), Runtime.Ubuntu_14);
                });

                // scenario: fallback to centos
                mapping = {};
                mapping[Runtime.CentOS] = Runtime.CentOS;
                mapping[Runtime.Ubuntu] = Runtime.Ubuntu;
                mapping[Runtime.Linux] = Runtime.Linux;
                config.downloadFileNames = mapping;
                runtimesToTest = [Runtime.CentOS, Runtime.OracleLinux];
                runtimesToTest.forEach(runtime => {
                        assert.equal(provider.getDownloadFileName(runtime), Runtime.CentOS);
                });
        });
});

