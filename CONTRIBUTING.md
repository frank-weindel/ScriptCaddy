# How to Contribute

This section describes best practices for submitting issues / feature requests and PRs. To learn how to build & run ScriptCaddy on your local machine see the [How to Set Up Your Dev Environment](#how-to-set-up-your-dev-environment) section below.

These guidelines are subject to change and potentially change rapidly since this is a young project.

## Issues / Feature Requests

If you'd like to report an issue with ScriptCaddy or suggest a feature feel free to utilize the [Issues feature](https://github.com/frank-weindel/scriptcaddy/issues) within the GitHub project.

## Pull Requests

If you'd like to contribute a fix or feature implementation for an _already_ documented GitHub issue you may submit a [pull request](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/about-pull-requests) (aka PR). Your PR will be reviewed by a project maintainer when able. Be sure to submit the PR against the `main` branch of the project (unless otherwise directed).

Be sure the feature or fix you submit has an existing GitHub issue and reference the number of that issue in your PR title.

Submitting a PR will unfortunately not guarantee that your contribution will be accepted and merged into the project. The project administrator and maintainers have the right to reject any contribution for any reason. To improve the likelihood of your contribution being accepted be sure to adhere closely to our [code of conduct](CODE_OF_CONDUCT.md), follow any guidance from project maintainers, and be an active participant in the associated GitHub issue's conversation. Make sure to mention that you are thinking about writing or are already working on a PR within the issue.

# How to Set Up Your Dev Environment

## Preparation

You should only need to NPM install to begin.

```
npm install
```

## Build/Launch in Dev Mode

Changes to renderer code will automatically refresh in the application. However changes to the main / preload code currently require you to re-run this command.

```
npm start
```

## Build executable for current OS

ScriptCaddy uses Electron Forge in order to build executable packages/installers for all platforms. This command builds it for your current OS.

```
npm run make
```

## Unit Testing

Coming soon!

## Linting

This project uses eslint to enforce our coding standards. Be sure to configure your IDE to show you linting errors and run this command before committing.

```
npm run test:lint
```

If you use VS Code it's recommended that you install the [ESLint package](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint).

