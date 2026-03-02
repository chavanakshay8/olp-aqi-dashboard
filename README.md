# OLP_AQI-31F

## GitHub Pages + Chrome Extension Setup

This project now fetches CPCB data directly from:

`https://api.data.gov.in/resource/3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69?...`

Because of browser CORS, you must enable a Chrome CORS extension on each display device.

### Recommended steps (for your controlled 8 devices)

1. Install a CORS extension in Chrome (example: "CORS Unblock").
2. Open extension options and whitelist only your GitHub Pages domain.
3. Enable extension when showing this dashboard.
4. Disable extension when not needed.

Note: This is a controlled-device workaround, not a public production pattern.
