# 12. Deployment Guide

The site is hosted on GitHub Pages.

- **Subtree Push**: Deployed via `git subtree push --prefix apps/site/public/legacy origin gh-pages`.
- **Cache Busting**: Due to aggressive CDN caching, CSS and JS imports use a query parameter (`?v=XX`). This must be incremented in `index.html` on every significant deployment to ensure end-users receive the latest styles and logic.
