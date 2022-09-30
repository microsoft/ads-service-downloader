# ADS Service Downloader

Download a file and decompresses it. Designed for use with Azure Data Studio.

## Usage

⚠️IMPORTANT⚠️: The runtime mapping logic has changed significantly in 1.0.0. If upgrading from an earlier version make sure to update your config appropriately.

### Sample code
```TypeScript
const serverdownloader = new ServerProvider(config);
const executablePath = await serverdownloader.getOrDownloadServer();
```
### Sample configuration file
```JSON
{
	"downloadUrl": "https://github.com/Microsoft/sqltoolsservice/releases/download/{#version#}/microsoft.sqltools.servicelayer-{#fileName#}",
	"version": "4.3.0.26",
	"downloadFileNames": {
		"Windows_86": "win-x86-net6.0.zip",
		"Windows_64": "win-x64-net6.0.zip",
		"OSX": "osx-x64-net6.0.tar.gz",
		"CentOS": "centos-x64-net6.0.tar.gz",
		"Ubuntu_16": "ubuntu16-x64-net6.0.tar.gz",
		"Ubuntu": "ubuntu-x64-net6.0.tar.gz",
		"Linux": "linux-x64-net6.0.tar.gz",
	},
	"installDirectory": "./sqltoolsservice/{#platform#}/{#version#}",
	"executableFiles": ["MicrosoftSqlToolsServiceLayer.exe", "MicrosoftSqlToolsServiceLayer"],
	"retry": {
		"retries": 15,
		"factor": 2,
		"minTimeout": 1000,
		"maxTimeout": 300000,
		"randomize": false
	}
}
```
#### Properties

`downloadUrl`: The template of the url to the service file. 2 placeholder variables are supported in this property.

	1. `{#version#}`: The version of the service defined by the `version` property.
	2. `{#fileName#}`: The matching value of the key-value pair in `downloadFileNames` property.

`version`: The version of the service.

`downloadFileNames`: The mapping between the runtimes (OS + OS Version) and their correspondent service files.

	1. The supported runtimes are defined in the [Runtime enum](https://github.com/microsoft/ads-service-downloader/blob/main/src/platform.ts#L13). 
	2. A fallback mechanism is available in case the current runtime is not specified in the config, e.g. the current runtime is Ubuntu 22, but it is not defined in the config, the package will also try Ubuntu and Linux until an entry is found. the fallback information is defined in the [fallback function](https://github.com/microsoft/ads-service-downloader/blob/main/src/platform.ts#L262). Follow the guidelines below to simplify the mapping information:
		a. When possible, define the platform level config, e.g. Linux and set its value to a service file that works for most of Linux distributions.
		b. Only define the specific runtime if necessary. e.g. Ubuntu 22 requires its own version of service file.

Please file an issue if a specific runtime that requires special handling is not listed in the runtime list.

## Development

- `yarn install`
- `yarn compile` to compile sources
- `yarn test` to run tests

## Releasing

Release a new version of the extension by:

1. `git checkout main`
2. `git pull`
3. Update version in `package.json` and commit/push that change
4. `git tag <version>` (e.g. `git tag 0.2.2`)
5. Run `git push --tags`
6. The release will be created in Github automatically by the CD pipeline, go to it and download the package artifact (tgz)
7. Run `npm publish <path to tarball>`

## License

[MIT](LICENSE)

## Contributing

This project welcomes contributions and suggestions. Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.microsoft.com.

When you submit a pull request, a CLA-bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., label, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
