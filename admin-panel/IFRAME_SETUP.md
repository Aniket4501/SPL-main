# Iframe Embedding & Auto-Resize Setup Guide

## Overview
The admin panel has been optimized for embedding in an iframe with automatic height resizing.

## Changes Made

### 1. Horizontal Overflow Fixes

**Issues Fixed:**
- Added `overflow-x: hidden` to `html` and `body` elements
- Added `width: 100%` constraints to all major containers
- Added `box-sizing: border-box` to prevent padding/border from causing overflow
- Made tables responsive with `overflow-x: auto` wrapper
- Added responsive breakpoints for mobile devices

**Files Modified:**
- `admin-panel/styles.css` - Added overflow prevention and responsive styles
- `admin-panel/index.html` - Already had proper viewport meta tag

### 2. Auto-Resize Implementation

**Child Page (index.html):**
- Added postMessage script that sends height updates to parent
- Monitors page load, resize events, and dynamic content changes
- Uses ResizeObserver for modern browsers

**Parent Page (iframe-resize.js):**
- Listens for height messages from child iframe
- Automatically updates iframe height
- Supports multiple iframes with `data-autoresize="true"` attribute

## Setup Instructions

### Step 1: Embed the iframe in your parent page

Add this HTML to your parent page:

```html
<iframe
  src="YOUR_DEPLOYED_VERCEL_URL"
  data-autoresize="true"
  style="width:100%; border:0; display:block;"
  loading="lazy"
></iframe>
```

### Step 2: Include the parent resize script

Include the `iframe-resize.js` script in your parent page:

```html
<script src="path/to/iframe-resize.js"></script>
```

Or embed it directly:

```html
<script>
  window.addEventListener("message", function(event) {
    if (!event.data || event.data.type !== "setHeight") return;
    const iframe = document.querySelector("iframe[data-autoresize='true']");
    if (iframe) iframe.style.height = event.data.height + "px";
  });
</script>
```

### Step 3: Security (Production)

**Important:** For production, restrict the message origin for security:

In `iframe-resize.js`, replace the wildcard `"*"` with your specific domain:

```javascript
// Instead of:
parent.postMessage({ type: "setHeight", height }, "*");

// Use:
parent.postMessage({ type: "setHeight", height }, "https://your-parent-domain.com");
```

And in the parent listener:

```javascript
window.addEventListener("message", function(event) {
  // Only accept messages from your Vercel deployment
  if (event.origin !== "https://your-vercel-app.vercel.app") return;
  
  // ... rest of the code
});
```

## How It Works

### Auto-Resize Mechanism

1. **Child Page (admin-panel/index.html):**
   - Calculates its scroll height: `document.documentElement.scrollHeight`
   - Sends height to parent via `postMessage`
   - Triggers on: page load, window resize, and dynamic content changes

2. **Parent Page:**
   - Listens for `"setHeight"` messages
   - Finds the iframe with `data-autoresize="true"` attribute
   - Updates iframe height to match content

### What Causes Overflow & How It's Fixed

**Original Issues:**
1. **Fixed widths** - Some containers had fixed pixel widths that didn't adapt to iframe width
   - **Fixed:** Added `max-width: 100%` and `box-sizing: border-box`

2. **Padding/Borders** - Padding on containers could cause overflow when combined with width: 100%
   - **Fixed:** Added `box-sizing: border-box` to all elements

3. **Tables** - Wide tables could overflow on small screens
   - **Fixed:** Wrapped in `overflow-x: auto` container, tables scroll horizontally when needed

4. **Viewport units** - Using `100vw` can cause overflow due to scrollbar
   - **Fixed:** Changed to `width: 100%` instead

5. **Missing overflow prevention** - No `overflow-x: hidden` on root elements
   - **Fixed:** Added to `html` and `body`

## Testing Checklist

- [ ] Test iframe on desktop (1920px, 1366px widths)
- [ ] Test iframe on tablet (768px width)
- [ ] Test iframe on mobile (375px, 320px widths)
- [ ] Verify no horizontal scrollbar appears
- [ ] Verify height adjusts automatically when content loads
- [ ] Verify height adjusts when tables expand/collapse
- [ ] Test in different browsers (Chrome, Firefox, Safari, Edge)

## Browser Support

- **ResizeObserver:** Modern browsers (Chrome 64+, Firefox 69+, Safari 13.1+)
- **postMessage:** All modern browsers
- **Fallback:** Script works without ResizeObserver (uses resize events only)

## Troubleshooting

**Issue:** Iframe height not updating
- Check browser console for postMessage errors
- Verify `data-autoresize="true"` attribute is present
- Check if parent page is blocking messages (CSP headers)

**Issue:** Horizontal scrollbar still appears
- Check for inline styles with fixed widths
- Verify `overflow-x: hidden` is applied to html/body
- Check tables aren't forcing min-width

**Issue:** Content cut off
- Increase initial iframe height in parent
- Check if ResizeObserver is supported (falls back to resize events)

## Files Modified

1. `admin-panel/index.html` - Added auto-resize script
2. `admin-panel/styles.css` - Fixed overflow issues, added responsive styles
3. `admin-panel/iframe-resize.js` - NEW FILE: Parent-side resize listener

## Notes

- Visual design remains unchanged - only responsiveness and resize mechanism added
- All changes are backwards compatible
- Works with both static and dynamic content

