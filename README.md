# MTC Helper

## Design

The core of the design is `MutationHandler` (`src/mtc/MutationHandler.ts`) listening to
MTC's Next.js root element which will run actions. Actions take in the current state and
the target element and return new state (basically a reducer). The actions and
initialization can be found in `src/hooks/useMutationHandler.ts`.

DOM changes -> `MutationHandler` calls actions -> actions return state ->
`MutationHandler` applies state to the Zustand store -> React components update

Most of the particularly bad legacy code from the pre-extension days is isolated in
React hooks.

## Adding functionality

The basics of adding functionality:

1. Create a new function that takes `SomeState` (see `src/store`) and the target element
   as parameters and returns `SomeState`. This should be in `src/mtc/actions`.
2. Create a new selector or selectors for the element(s) to monitor.
3. In `src/hooks/useMutationHandler.ts`, add your action and selector:

```ts
mutationHandler.addAction(
    mySelector,
    myAction,
    someStore,
    {
        markElement: 'my-seen-indicator',
        runIfElementMissing: false,
        processes: ['STEM', 'Orochi']
    }
);
```

- `markElement` tells `MutationHandler` not to run the action if the mark is detected on
the element and to add that mark if it is not present. This can be used to prevent
handlers from running multiple times for the same element.

- `runIfElementMissing` tells `MutationHandler` to run the action whether the element is
 present or not. This is useful for triggering actions that need to be taken when an
 element is removed.

## State management

State is managed in [Zustand](https://github.com/pmndrs/zustand) stores (`src/store`).
They should be fairly self-explanatory. [Avoid adding nested objects to the
stores](https://github.com/pmndrs/zustand/blob/33cd0c0dd15307a98d859b7993c4160fa6f98b0b/docs/guides/updating-state.md#deeply-nested-object).

The stores use a logging middleware (`src/store/storeMiddleware.ts`) so that state can
be easily observed in the browser console. This logging middleware, along with all other
logging in this extension, uses the logging functions in `src/lib/logging.ts`.

## Injected script

There is a script injected on the page (`inject/inject.ts`) that passes mutations from
the page's Monaco editor object to the extension by way of `window.postMessage`. This is
because there is sandboxing in place that prevents the extension from accessing the
page's Monaco editor object directly.

## Known issues

- KaTeX fonts get automatically packaged with the extension but the app encounters
  errors trying to load them on MTC.
- Text that can't be parsed as LaTeX being passed to the LaTeX parser will cause
  warnings, but it still functions fine. This can be solved by only passing LaTeX into
  the LaTeX component. Currently, the entire text is being passed in. My recommendation
  is to render markdown first, then pass LaTeX into the LaTeX component by looki##
  Development ng for LaTeX delimiters.

## Future

- Look into react-markdown, remark, and rehype for improving LaTeX and markdown
  rendering/processing.
- It would be really nice to be able to pass the mutation target to actions. There are
  currently issues with elements being detected when doing this for reasons I don't
  fully understand, but presumably it has to do with the virtual DOM. Read the comments
  in `src/mtc/MutationHandler.ts` for more information.
