# Sprite Sheet Inspector

Inspect sprite coordinates directly from webpage images.

## Features
- Pick any visible `<img>` or element with a CSS background image.
- Right-click images and choose **Inspect image as sprite sheet**.
- Drag a region and get natural-image `x`, `y`, `width`, and `height`.
- Manual coordinate editing and arrow-key nudging.
- Configurable row/column grid overlay.
- **Suggest Regular Grid** tests common sprite cell dimensions that evenly divide the image.
- Copy JSON measurements or CSS `background-position` snippets.

The tool measures coordinates without modifying the source image. Pixel-content auto-segmentation is intentionally not assumed because cross-origin images often cannot be read by canvas due browser security rules.
