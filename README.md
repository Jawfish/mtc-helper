# MTC Helper

## Adding functionality

### Basics

The core of the design is a `MutationObserver` (`src/lib/init.ts`) listening to MTC's Next.js root element which will run handlers (`src/handlers`) based on the process. The handlers are defined in their respective subfolders in `src/handlers`, then imported into `src/handlers/index.ts` where they are added to a unified object and exported again for the `MutationObserver` to use.

The basics of adding functionality to MTC Helper is to create a new handler that adheres to `type MutHandler = (target: Element) => void`, then add it to the object in `src/handlers/index.ts`. It will be automatically run by the `MutationObserver`, passing the mutation target in as the `target` parameter. At the time of writing, most handlers don't use the `target` parameter because there were some issues presumably related to the use of a virtual DOM in MTC. As a result, most handlers just use `document.querySelector` calls to find the elements they need to interact with. To prevent performance issues, there are some guards in place on the `MutationObserver` to prevent the handlers from running when they don't need to.

### State management

State is managed in [Zustand](https://github.com/pmndrs/zustand) stores (`src/store`). Currently, Orochi has its own store (`src/store/orochiStore.ts`) and all other processes are considered "general" (`src/store/generalStore.ts`). These stores contain state relating to a single conversation. There is a global store (`src/store/globalStore.ts`) for tracking state external to conversations, like the current process and if a task is open or not. The general/Orochi stores subscribe to the global store to reset themselves when a task is closed.

The stores use a logging middleware (`src/store/storeMiddleware.ts`) so that state can be easily observed in the browser console. This logging middleware, along with all other logging in this extension, uses the logging functions in `src/lib/logging.ts`.

### Injected script

There is a script injected on the page (`inject/inject.ts`) that passes mutations from the page's Monaco editor object to the extension by way of `window.postMessage`. This is because there is sandboxing in place that prevents the extension from accessing the page's Monaco editor object directly.

### Additional notes

This started as a bookmarklet, then a collection of bookmarklets, then a single JavaScript file extension, and now it's a full extension built on TypeScript and React. Since there were never really plans to get this far, some of the code is a bit messy and there are more side effects and coupling than I would like, but it has not caused significant headaches yet - mostly just difficulty in testing.

Pretty much all tests just use the real Zustand stores directly; no injected dependencies, no mocking. I never really found a satisfying way to test functionality that relies on the DOM, so some of the tests use mocked selectors and some use a mocked DOM.

### Confidentiality

There is no confidential information contained within the code. No clients are mentioned, code names are being used for processes (like "Orochi"), tests based on content from the real process are sanitized to test the same issue with different data, and selectors are using generic class names and attributes. MTC Helper does not interact with the backend at all, only the DOM.
