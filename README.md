# D.J. Zamora — GitHub Pages site

This is a static academic website ready to be deployed on GitHub Pages.

## How to publish

1. Create a GitHub repository.
2. Upload all files in this folder to the repository root.
3. Go to **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select **main** and **/root**.
6. Save.

If your repository is named `djzamora.github.io` and belongs to the `djzamora` user or organization, the site will be served from:

`https://djzamora.github.io`

Otherwise it will be served from something like:

`https://your-user.github.io/repository-name/`

## Notes

- The site is bilingual (EN/ES).
- The collaboration map lives on `collaborations.html` and uses the data array defined in `assets/js/main.js`.
- The current collaborator list is editable; you can change names, institutions and coordinates directly in the JS file.
- The contact form uses `mailto:` because GitHub Pages does not provide a server-side backend.
- If you later want to turn the site into a group webpage, most sections can be reused with only small content changes.
