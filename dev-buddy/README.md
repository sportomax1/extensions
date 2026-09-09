# Dev Buddy

A lightweight F12-like on-page developer inspector. It does **not** replace Chrome DevTools, but gives you fast inspection without opening DevTools.

## Features
- Element picker with highlight.
- Selector, attributes, bounds, text, and key computed CSS values.
- Page metadata and viewport/document diagnostics.
- LocalStorage, SessionStorage, and JS-visible cookies.
- Link and image inventories.
- Captured page errors/unhandled promise rejections from extension load onward.
- Copy current diagnostic output.
- Draggable floating panel.
- Toolbar icon toggles the panel.

## Limitations
Chrome extensions cannot fully recreate every DevTools capability. Network waterfall, source-level debugging, breakpoints, and privileged browser internals still require Chrome DevTools.
