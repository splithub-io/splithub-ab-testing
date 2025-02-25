# Splithub AB Testing Librar

![Splithub Logo](https://splithub.io/assets/img/sh-intro.jpg)

**[Splithub.io](https://github.com/splithub-io/ab-easy) AB Testing Library** is a free, open-source Node library designed for integrating A/B testing into your website with minimal setup. It supports both "redirect" and "edits" test types and provides the flexibility to define a global configuration while triggering tests only on designated pages.

## Features

-   **Global Configuration:**  
    Define all your A/B tests in one place and control which pages should trigger specific tests.
    
-   **Page-Specific Triggering:**  
    Use the `path` or `pages` properties in your test configuration to ensure tests run only on designated pages.
    
-   **Flexible Test Types:**
    
    -   **Redirect:** Automatically redirect users to different URLs based on their assigned variant.
    -   **Edits:** Modify page elements (e.g., hide or show blocks) based on the assigned variant.
-   **Persistent Variant Assignment:**  
    Variants are stored using either cookies or `localStorage`, ensuring a consistent experience for users across sessions.
    
-   **Google Analytics Integration:**  
    Optionally send events to Google Analytics (supports both `ga` and `gtag`).
    
## Installation

Install the package via npm:

`npm install splithub-ab-testing` 

Or include the script directly in your project if you prefer manual bundling. [Download JS](https://github.com/splithub-io/ab-easy).


## Usage

### Import and Global Configuration

First, import the library in your project. Then define your global test configuration and specify which pages should trigger the tests. Finally, call the `runTestsForPage` method to process tests only on the current page.

> **Note:** You can generate your test configuration on our [AB Test Config Builder](https://splithub.io/builder) or directly in your test settings via the Splithub user dashboard.


    // Import the library (using ES Module syntax)
    import ABTester from "splithub-ab-testing";
    
    // Define your global A/B test configuration
    const abTestConfig = [
      {
        id: "redirectTest1",
        type: "redirect",
        // Run this test only on the homepage and /special-page
        pages: ["/", "/special-page"],
        status: "active",
        storage: "localStorage",
        cookieExpiration: 7,
        sendEvent: true,
        gaEventName: "RedirectTest1",
        variants: [
          { name: "A", value: "/variantA" },
          { name: "B", value: "https://splithub.io/variant_b" }
        ]
      },
      {
        id: "editTest1",
        type: "edits",
        // Run this test only on the /features page
        path: "/features",
        status: "active",
        storage: "localStorage",
        cookieExpiration: 7,
        sendEvent: false,
        variants: [
          { name: "A", value: "hide" },
          { name: "B", value: "show" }
        ]
      }
    ];
    
    // Initialize the tester with the global configuration
    const tester = new ABTester(abTestConfig);
    
    // Run tests only for the current page (based on window.location.pathname)
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => tester.runTestsForPage());
    } else {
      tester.runTestsForPage();
    }

### Detailed Explanation

-   **Global Configuration:**  
    Define your tests in an array. Each test object includes properties such as:
    
    -   `id`: Unique identifier for the test.
    -   `type`: Either `"redirect"` or `"edits"`.
    -   `pages` or `path`: An array of pages or a single page where the test should run. If omitted, the test will run on every page.
    -   `status`: Should be `"active"` for the test to be processed.
    -   `storage`: Method for storing the variant (`"cookie"` or `"localStorage"`).
    -   `cookieExpiration`: Number of days until the cookie expires (if using cookie storage).
    -   `sendEvent`: Whether to send a Google Analytics event.
    -   `gaEventName`: Custom event name for GA tracking.
    -   `variants`: An array of variant objects, each with a `name` and a `value`.
-   **Page-Specific Triggering:**  
    The method `runTestsForPage` iterates over the configuration and processes only those tests whose `path` or `pages` match the current `window.location.pathname`.
    
-   **Persistent Assignment:**  
    Once a variant is chosen for a test, it is stored in `localStorage` or as a cookie to maintain consistency across sessions.
    
-   **Google Analytics Integration:**  
    If `sendEvent` is set to true, an event is sent using either the `ga` or `gtag` method, allowing you to track test performance.
    

## API Reference

### Class: `ABTester`

#### Constructor

`new ABTester(config = [])` 

-   **Parameters:**
    -   `config` (Array): An array of test configuration objects.

#### Methods

-   **`setConfig(config)`**  
    Update the global test configuration.
    
    -   **Parameters:**
        -   `config` (Array): New array of test configuration objects.
-   **`runTestsForPage()`**  
    Processes and runs tests that match the current page based on the `path` or `pages` properties.
    
-   **Internal Helpers:**  
    Methods like `setCookie`, `getCookie`, `sendGAEvent`, and `getTestVariant` handle the low-level operations such as storage and event dispatching.
    

## License

This project is licensed under the [MIT License](LICENSE).


## Support & Contributing

If you have any questions, suggestions, or need support, please visit our [Splithub website](https://splithub.io) or open an issue in the repository. Contributions are welcome!

----------

Enjoy A/B testing and optimizing your website with the Splithub AB Testing Library!