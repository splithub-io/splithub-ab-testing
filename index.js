/**
 * Splithub AB Testing
 * 
 * This library provides a simple interface to initialize and run A/B tests,
 * supporting both "redirect" and "edits" test types. It allows you to define
 * a global configuration and then trigger tests only on pages that match your configuration.
 */

class ABTester {
    /**
     * Create an instance of ABTester.
     * @param {Array} config - Array of test configuration objects.
     */
    constructor(config = []) {
      this.config = config;
      this.results = {}; // For storing results of tests with type "edits"
    }
  
    /**
     * Update the global test configuration.
     * @param {Array} config - Array of test configuration objects.
     */
    setConfig(config) {
      if (!Array.isArray(config)) {
        throw new Error("Configuration must be an array of tests.");
      }
      this.config = config;
    }
  
    // Helper: Set a cookie
    setCookie(name, value, days) {
      let expires = "";
      if (days) {
        const date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = "; expires=" + date.toUTCString();
      }
      document.cookie = name + "=" + (value || "") + expires + "; path=/";
    }
  
    // Helper: Get a cookie value
    getCookie(name) {
      const nameEQ = name + "=";
      const ca = document.cookie.split(";");
      for (let i = 0; i < ca.length; i++) {
        const c = ca[i].trim();
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
      }
      return null;
    }
  
    // Helper: Send event to Google Analytics (supports both ga and gtag)
    sendGAEvent(category, action, label) {
      if (window.ga && typeof window.ga === "function") {
        window.ga("send", "event", category, action, label);
      } else if (window.gtag && typeof window.gtag === "function") {
        window.gtag("event", action, {
          event_category: category,
          event_label: label,
        });
      } else {
        console.log("GA Event:", category, action, label);
      }
    }
  
    // Retrieve or assign a variant for a given test
    getTestVariant(test) {
      const storageKey = "abTest_" + test.id;
      let storedVariant = null;
  
      // Retrieve previously saved variant using cookie or localStorage
      if (test.storage === "cookie") {
        storedVariant = this.getCookie(storageKey);
      } else {
        storedVariant = localStorage.getItem(storageKey);
      }
  
      if (storedVariant) {
        const existing = test.variants.find(v => v.name === storedVariant);
        if (existing) return existing;
      }
  
      // Randomly choose a variant
      const randomIndex = Math.floor(Math.random() * test.variants.length);
      const variant = test.variants[randomIndex];
  
      // Save the assigned variant
      if (test.storage === "cookie") {
        this.setCookie(storageKey, variant.name, test.cookieExpiration || 7);
      } else {
        localStorage.setItem(storageKey, variant.name);
      }
  
      return variant;
    }
  
    // Process an individual test
    processTest(test) {
      // Only process tests marked as "active"
      if (test.status !== "active") return;
  
      // Check if the test is meant to run on the current page.
      // You can define a single page using the "path" property, or multiple pages using "pages".
      const currentPath = window.location.pathname;
      if (test.pages && Array.isArray(test.pages)) {
        if (!test.pages.includes(currentPath)) return;
      } else if (test.path) {
        if (test.path !== currentPath) return;
      }
      // If no path or pages are specified, the test runs on every page.
  
      const variant = this.getTestVariant(test);
  
      // Optionally send a GA event if enabled in the config
      if (test.sendEvent) {
        const eventName = test.gaEventName || test.id;
        this.sendGAEvent("ABTest", eventName, variant.name);
      }
  
      // Act based on the test type
      if (test.type === "redirect") {
        let targetUrl = variant.value;
        // Convert relative URLs to absolute URLs
        if (!/^https?:\/\//i.test(targetUrl)) {
          targetUrl = window.location.origin + targetUrl;
        }
        // Redirect only if not already on the target URL
        if (window.location.href !== targetUrl) {
          window.location.href = targetUrl;
        }
      } else if (test.type === "edits") {
        // Store the result so that custom code can adjust the page as needed
        this.results[test.id] = variant;
  
        // Dispatch a custom event to notify that an edit test has been triggered
        const event = new CustomEvent("abTestEditsTriggered", {
          detail: { testId: test.id, variant: variant },
        });
        window.dispatchEvent(event);
      }
    }
  
    /**
     * Run tests for the current page.
     * It filters the global configuration based on defined "path" or "pages" properties.
     */
    runTestsForPage() {
      this.config.forEach(test => {
        this.processTest(test);
      });
    }
  }
  
  // Export as default to allow users to import the library easily.
  export default ABTester;
  