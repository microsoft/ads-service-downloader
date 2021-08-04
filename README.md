# ADS Service Downloader

Download a file and decompresses it. Designed for use with Azure Data Studio.

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
