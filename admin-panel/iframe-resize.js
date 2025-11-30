/**
 * Iframe Auto-Resize Parent Script
 * 
 * Add this script to your parent page that contains the iframe.
 * 
 * Usage:
 * 1. Include this script in your parent page
 * 2. Add data-autoresize="true" attribute to your iframe
 * 
 * Example iframe embed code:
 * <iframe
 *   src="YOUR_DEPLOYED_VERCEL_URL"
 *   data-autoresize="true"
 *   style="width:100%; border:0; display:block;"
 *   loading="lazy"
 * ></iframe>
 */

(function() {
    'use strict';
    
    // Listen for messages from child iframe
    window.addEventListener("message", function(event) {
        // Security: In production, replace "*" with your specific domain
        // Example: if (event.origin !== "https://your-vercel-app.vercel.app") return;
        
        if (!event.data || event.data.type !== "setHeight") {
            return;
        }
        
        // Find all iframes with data-autoresize attribute
        const iframes = document.querySelectorAll('iframe[data-autoresize="true"]');
        
        // Find the iframe that sent this message
        let targetIframe = null;
        iframes.forEach(function(iframe) {
            try {
                // Check if this iframe's contentWindow matches the event source
                if (iframe.contentWindow === event.source) {
                    targetIframe = iframe;
                }
            } catch (e) {
                // Cross-origin check might fail, try by src
                if (iframe.src && event.origin && iframe.src.startsWith(event.origin)) {
                    targetIframe = iframe;
                }
            }
        });
        
        // If we can't find the specific iframe, update all iframes (less secure but works)
        if (!targetIframe && iframes.length === 1) {
            targetIframe = iframes[0];
        }
        
        // Update iframe height
        if (targetIframe && event.data.height) {
            targetIframe.style.height = event.data.height + "px";
        } else if (iframes.length > 0 && event.data.height) {
            // Fallback: update all iframes if we can't identify the sender
            iframes.forEach(function(iframe) {
                iframe.style.height = event.data.height + "px";
            });
        }
    });
    
    // Optional: Set initial height on load
    window.addEventListener("load", function() {
        const iframes = document.querySelectorAll('iframe[data-autoresize="true"]');
        iframes.forEach(function(iframe) {
            // Set initial height to prevent flash of incorrect height
            iframe.style.minHeight = "400px";
        });
    });
})();

