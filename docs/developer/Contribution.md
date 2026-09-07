# Developer Contribution Guide

## 1. Code of Conduct
We maintain a professional, collaborative, and friendly workspace. All contributions must respect biological correctness, breeder privacy, and offline-first performance guidelines.

## 2. Git Workflow
- **Development Branch:** All daily features are merged into `dev`.
- **Release Candidates:** Changes are promoted to `rc/sprint-*` for thorough QA vetting.
- **Production Branch:** Fully stabilized code is pushed to `main` with SemVer tags (e.g. `v1.0.0`).

## 3. Pull Request Requirements
- The code must be clean, lint-free (`npm run lint`), and build successfully (`npm run build`).
- Ensure no hardcoded strings are added; all user-facing copy must be declared in translations.
- Include unit test assertions where appropriate.
