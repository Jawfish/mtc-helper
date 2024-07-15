# MTC Helper

## Development

### Design

The core of the design is a `MutationObserver` (`src/lib/init.ts`) listening to MTC's
Next.js root element which will run handlers based on the process. The handlers are
imported into `src/handlers/index.ts` where they are added to a unified object and
exported again for the `MutationObserver` to use. The flow is as follows:

From MTC to the extension:

- DOM changes -> MutationObserver calls handlers -> handlers update Zustand store state

Within the extension:

- Reacting to state changes: Zustand store updates -> React hook performs logic ->
  Component renders
- Reacting to input: User does something -> Component calls React hook -> Zustand store
  updates

Most of the particularly bad legacy code from the pre-extension days is isolated in React hooks.

### Adding functionality

The basics of adding functionality:

1. Create a new handler (`type MutHandler = (target: Element) => void`)
2. Add it to the object in `src/handlers/index.ts`. It will be automatically run by the
   `MutationObserver`, passing the mutation target in as the `target` parameter.

At the time of writing, most handlers don't use the `target` parameter because there
were some issues presumably related to the use of a virtual DOM in MTC. As a result,
most handlers just use `document.querySelector` calls to find the elements they need to
interact with. To prevent performance issues, there are some conditionals in the
`MutationObserver` to prevent the handlers from running when they don't need to.

### State management

State is managed in [Zustand](https://github.com/pmndrs/zustand) stores (`src/store`).
They should be fairly self-explanatory. [Avoid adding nested objects to
the stores](https://github.com/pmndrs/zustand/blob/33cd0c0dd15307a98d859b7993c4160fa6f98b0b/docs/guides/updating-state.md#deeply-nested-object).

The stores use a logging middleware (`src/store/storeMiddleware.ts`) so that state can
be easily observed in the browser console. This logging middleware, along with all other
logging in this extension, uses the logging functions in `src/lib/logging.ts`.

### Injected script

There is a script injected on the page (`inject/inject.ts`) that passes mutations from
the page's Monaco editor object to the extension by way of `window.postMessage`. This is
because there is sandboxing in place that prevents the extension from accessing the
page's Monaco editor object directly.

### Known issues

- KaTeX fonts get automatically packaged with the extension but the app encounters
  errors trying to load them on MTC.
- Text that can't be parsed as LaTeX being passed to the LaTeX parser will cause
  warnings, but it still functions fine.

### Troubleshooting

- Make sure you are exporting handlers in `src/handlers/index.ts`.

### Future

- Look into react-markdown, remark, and rehype for improving LaTeX and markdown
  rendering/processing.
- If performance ever becomes an issue, create mini mutation observers that are narrower
  in scope and call only the relevant handlers when only the relevant elements mutate
  rather than acting on the entire Next.js root element.

### Additional notes

Since this started as a bookmarklet that was never intended to become this
comprehensive, some of the code is messy and there are more side effects and coupling
than I would like. It has not caused significant headaches yet - mostly just difficulty
in testing.

The tests aren't super consistent since the first few iterations were much less
ambitious. Thoughtful design wasn't really a consideration. I never found a satisfying
way to test functionality that relies on the DOM, but I have found it to be least
fragile to mock selectors rather than mocking the DOM. The tradeoff there is that you
are putting more trust in the selectors, but those are trivial to tweak.

### Confidentiality

There is no confidential information contained within the code. No clients are
mentioned, code names are being used for processes (like "Orochi"), tests based on real
content are sanitized to test the same issue with different data, and selectors are
using generic class names and attributes. MTC Helper does not interact with the backend
at all, only the DOM.
