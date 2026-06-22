# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: bulkAudit.spec.js >> Bulk Audit Tests @bulk @regression >> BA_004 - Verify Run button is disabled before rows loaded @bulk @regression
- Location: tests\bulkAudit.spec.js:17:9

# Error details

```
Error: browser.newContext: Target page, context or browser has been closed
Browser logs:

<launching> C:\Users\manoh\AppData\Local\ms-playwright\chromium-1223\chrome-win64\chrome.exe --disable-field-trial-config --disable-background-networking --disable-background-timer-throttling --disable-backgrounding-occluded-windows --disable-back-forward-cache --disable-breakpad --disable-client-side-phishing-detection --disable-component-extensions-with-background-pages --disable-component-update --no-default-browser-check --disable-default-apps --disable-dev-shm-usage --disable-edgeupdater --disable-extensions --disable-features=AvoidUnnecessaryBeforeUnloadCheckSync,BoundaryEventDispatchTracksNodeRemoval,DestroyProfileOnBrowserClose,DialMediaRouteProvider,GlobalMediaControls,HttpsUpgrades,LensOverlay,MediaRouter,PaintHolding,ThirdPartyStoragePartitioning,Translate,AutoDeElevate,RenderDocument,OptimizationHints,msForceBrowserSignIn,msEdgeUpdateLaunchServicesPreferredVersion --enable-features=CDPScreenshotNewSurface --allow-pre-commit-input --disable-hang-monitor --disable-ipc-flooding-protection --disable-popup-blocking --disable-prompt-on-repost --disable-renderer-backgrounding --force-color-profile=srgb --metrics-recording-only --no-first-run --password-store=basic --use-mock-keychain --no-service-autorun --export-tagged-pdf --disable-search-engine-choice-screen --unsafely-disable-devtools-self-xss-warnings --edge-skip-compat-layer-relaunch --disable-infobars --disable-search-engine-choice-screen --disable-sync --enable-unsafe-swiftshader --no-sandbox --user-data-dir=C:\Users\manoh\AppData\Local\Temp\playwright_chromiumdev_profile-UlCPxu --remote-debugging-pipe --no-startup-window
<launched> pid=4968
[pid=4968][err] [4968:24448:0617/145451.817:ERROR:google_apis\gcm\engine\registration_request.cc:291] Registration response error message: DEPRECATED_ENDPOINT
[pid=4968][err] [4968:24448:0617/145517.431:ERROR:google_apis\gcm\engine\registration_request.cc:291] Registration response error message: DEPRECATED_ENDPOINT
[pid=4968][err] [4968:24448:0617/145614.569:ERROR:google_apis\gcm\engine\registration_request.cc:291] Registration response error message: DEPRECATED_ENDPOINT
[pid=4968][err] [4968:23400:0617/145629.755:ERROR:components\system_cpu\cpu_probe_win.cc:120] PdhCollectQueryData failed: Error (0x13D) while retrieving error. (0x800007D5)
[pid=4968][err] [4968:22232:0617/145642.808:ERROR:components\system_cpu\cpu_probe_win.cc:134] PdhGetFormattedCounterValue failed: Error (0x13D) while retrieving error. (0xC0000BC6)
[pid=4968][err] [4968:24448:0617/145744.190:ERROR:google_apis\gcm\engine\registration_request.cc:291] Registration response error message: DEPRECATED_ENDPOINT
[pid=4968][err] [4968:2884:0617/145805.322:ERROR:chrome\browser\ui\views\user_education\impl\browser_user_education_interface_impl.cc:181] Attempting to show IPH IPH_ExtensionsZeroStatePromo before browser initialization complete; IPH will not be shown.
[pid=4968] <gracefully close start>
```