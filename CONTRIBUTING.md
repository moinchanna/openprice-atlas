# Contributing to OpenPrice Atlas

Thank you for your interest in contributing to **OpenPrice Atlas**! Here are the guidelines to help you get started with development, testing, and submitting pull requests.

## Development Workflow

1.  **Fork and Clone**: Fork this repository and clone it to your local machine.
2.  **Install Dependencies**: Install the development dependencies:
    ```bash
    npm install
    ```
3.  **Run Development Server**: Start the local server for rapid iterations:
    ```bash
    npm run dev
    ```
4.  **Local Testing**: Ensure that all changes are backed by robust unit tests. Verify that tests pass successfully:
    ```bash
    npm run test
    ```
5.  **Quality Checks**: Before committing, run linting and type checking checks:
    ```bash
    npm run lint
    ```
    ```bash
    npm run typecheck
    ```
6.  **Production Verification**: Confirm that your adjustments compile into a production-ready package:
    ```bash
    npm run build
    ```

## Submitting Pull Requests

*   Write clean, documented TypeScript.
*   Preserve existing codebase structures and naming conventions.
*   Do not bundle external fonts, images, or paid third-party dependencies.
*   Create atomic commits with descriptive titles.
*   Submit your pull request to the `main` branch.

## Manual GitHub Pages Setup

If you fork or replicate this repository, follow these steps to enable automatic deployments:
1.  Go to the repository on GitHub.
2.  Navigate to **Settings** -> **Pages**.
3.  Under **Build and deployment** -> **Source**, select **GitHub Actions**.
4.  Once selected, the workflow at `.github/workflows/deploy.yml` will automatically build and deploy the website upon every push to the `main` branch.
