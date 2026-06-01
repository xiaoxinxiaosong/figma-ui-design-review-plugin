# Privacy Policy Template

This template is a draft for publishing the plugin to the Figma Community. Host a final public version before submission if Figma asks for a privacy policy URL.

## Vision QA Privacy Policy

Last updated: 2026-05-27

Vision QA is a Figma plugin that compares an implementation screenshot with a design reference and generates an AI-assisted UI review.

### What the plugin processes

The plugin may process:

- Design screenshots exported from the user's current Figma selection
- Implementation screenshots uploaded by the user
- The AI provider, model, and API key chosen by the user
- Review results returned by the selected AI provider

### How data is used

The plugin uses the uploaded screenshots only to generate the requested UI review result.

### Third-party services

The plugin sends review requests directly to the AI provider selected by the user. Depending on the user's choice, requests may be sent to:

- OpenAI
- Google Gemini API
- OpenRouter
- Alibaba DashScope

The plugin author does not proxy these requests through a separate backend server.

### API keys

User API keys are stored locally using Figma client storage so the same user can reuse the last selected provider/model/API key combination.

The plugin does not intentionally send stored API keys to the plugin author's own server.

### Data retention

The plugin does not run its own backend and does not keep a separate server-side copy of screenshots or review results.

Any retention or processing performed by the selected AI provider is governed by that provider's own terms and privacy policy.

### Data sharing

The plugin does not sell user data.

### Contact

For support or privacy questions, contact:

- s1119551.kh@go.edu.tw
