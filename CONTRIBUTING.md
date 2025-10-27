# Contributing Guide

Thank you for considering contributing to this project! 💛

All contributions—issues, pull requests, or suggestions—are welcome.

Please follow this guide to help ensure smooth collaboration.



## 🧩 Development Environment

This project uses [Bun](https://bun.sh/) for a faster runtime during development and deployment.

However, **contributors do not need to use Bun** — Node.js or other JavaScript runtimes are fully supported.

If you prefer Node.js, make sure you’re using **v22.6.0 or higher**.

> [!NOTE]
> You can use **Bun** instead of **npm** unless stated otherwise.
>
> For example, `npm install` can be replaced with `bun install`.



## 🚀 Setup

Clone the repository and install dependencies.

1. Clone the repository:

    ```shell
    git clone https://github.com/kimzuni-labs/templify.git
    cd templify
    ```

2. Install dependencies:

    ```shell
    npm install
    ```

## 🎨 Linting

This project uses the following tools to maintain code quality:

- [ESLint](http://eslint.org/) (with [typescript-eslint](https://typescript-eslint.io/) and [ESLint Stylistic](https://eslint.style/))
- [markdownlint-cli2](https://github.com/DavidAnson/markdownlint-cli2)

You can run all lint checks with:

```shell
npm run lint
```

Or run them individually:

```shell
npm run lint:eslint
npm run lint:markdown
```

## 🧪 Testing

Make sure your changes work as expected.

```shell
bun run test
# or
npm run build && node tests/index.test.ts
```

> [!NOTE]
> If your Node.js version is **lower than v22.18.0**,
> add the `--experimental-strip-types` flag when running tests:
>
> ```shell
> npm run build && node --experimental-strip-types tests/index.test.ts
> ```



## 🧭 Pull Request Guide

Your pull request doesn't have to be perfect — just open it!
I'll help out if needed. ✨

1. **Keep your branch up to date**
    + Rebase or merge the latest `main` branch before opening a PR.
2. **Update related documentation and tests**
    + If you add or modify a feature, update any relevant documentation such as **README** files or **JSDoc comments**.
    + Also, write or update corresponding **test cases** to ensure your changes are covered.
    + Keeping documentation and tests up to date helps others understand and verify your changes.
3. **Run linting and tests**
    + Run linting and testing to verify your changes before submitting a PR.
    + See [Linting](#-linting) and [Testing](#-testing) for details.
4. **Keep PRs small and focused**
    + If your changes are minor, it's fine to include them all in a single pull request.  
    + If your changes are large or involve multiple features, please split them into separate PRs by feature or purpose.
    + Avoid bundling unrelated changes into one pull request, as large PRs are harder to review and delay merging.
5. **Write clear descriptions**
    + Explain what changes were made and why.
    + Mention related issues (e.g., `Closes #123`).

---

Thank you for helping improve the project! 💛
