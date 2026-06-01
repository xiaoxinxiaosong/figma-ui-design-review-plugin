# Figma Community Publish Kit

## Suggested Name

- Vision QA

## Short Tagline

- Compare design frames and implementation screenshots, then generate structured UI review reports directly in Figma.

## Full Description

Vision QA helps designers, PMs, and frontend teams review implementation quality against the final Figma design.

Upload or capture two images:

- Implementation screenshot
- Figma design reference

The plugin then analyzes visual differences, interaction-state mismatches, missing elements, copy issues, accessibility risks, and engineering implementation risks. Results are returned as a structured report and can be highlighted directly on the Figma canvas.

### Best for

- UI QA before release
- Design-to-implementation review
- Visual consistency checks
- Cross-team handoff validation
- Fast review of mobile product screens

### Key Features

- Compare implementation vs. design in one workflow
- Generate structured issue cards with severity and recommendations
- Highlight issue regions directly in Figma
- Support multiple AI providers
- Remember last-used provider, model, and provider-model API key pair locally for the current user
- Support Chinese, English, and Korean UI

## Suggested Category

- Design tools

## Suggested Search Tags

- ui qa
- design review
- visual diff
- figma review
- implementation audit

## Version Notes Draft

- Added multilingual landing and workspace UI
- Improved issue highlighting logic with stronger region priority
- Added provider/model/API key memory for repeated reviews
- Improved issue splitting so merged findings become separate cards
- Refined community-ready homepage assets and icon exports

## Data Security Draft

Use this wording when filling the Community `Data security` step, then adjust to the exact options Figma shows:

- This plugin sends the implementation screenshot and design screenshot to the AI provider selected by the user.
- Users explicitly provide their own API key.
- API keys are stored locally in Figma client storage for the current user and are not sent to the plugin author's own server.
- The plugin does not operate its own backend.
- The plugin does not sell data or use screenshots for advertising.
- Network requests are made only to the provider domains declared in `manifest.json`.

## Support Contact Draft

- Support email: s1119551.kh@go.edu.tw

## Publish Checklist

- `manifest.json` contains the Community Plugin ID
- `networkAccess.allowedDomains` matches actual runtime requests
- `networkAccess.reasoning` accurately explains why external requests are needed
- `icon.png` is ready as the plugin icon
- `homepage-icon.png` can be reused for listing imagery if needed
- `docs/community-thumbnail.png` is ready as a 1920x1080 Community thumbnail
- `dist/manifest.json` and `dist/code.js` build successfully
- Privacy policy text is prepared and hosted if Figma asks for a public URL
- Description clearly explains screenshots are sent to third-party AI providers chosen by the user
