# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build           # TypeScript compilation (tsc -p .)
npm test                # Run all tests (Jest via ts-jest)
npm run lint            # ESLint on src/**
npm run lint:fix        # ESLint autofix
npm run ci              # Lint + test (CI gate)
npm run dev             # Vite dev server on port 3000 (custom-bar-chart example)
npm run docgen          # Generate TypeDoc JSON to docs/typedoc.json
npm run bundle-dts      # Bundle .d.ts declarations into dist/
npm run prepublishOnly  # Full pipeline: lint → test → build → bundle-dts
```

## Tech Stack

-   **Language**: TypeScript 4.9, strict mode
-   **Build**: `tsc` for library compilation, Vite for dev server / examples
-   **Test**: Jest 27 + ts-jest, @testing-library/react for React hook tests
-   **Lint**: ESLint (Airbnb base) + Prettier (4-space indent, single quotes, trailing commas)
-   **Docs**: TypeDoc for API documentation generation
-   **Runtime**: Browser engines (V8/SpiderMonkey/JSC) — this is a client-side SDK
-   **Dependencies**: lodash, luxon (dates), globalize (i18n/number formatting), promise-postmessage (transport), React 17

## What This Is

`@thoughtspot/ts-chart-sdk` is the ThoughtSpot Custom Chart SDK (BYOC — Bring Your Own Chart). It lets developers build custom chart visualizations that plug into the ThoughtSpot analytics platform.

The SDK runs inside an iframe hosted by the ThoughtSpot app. It communicates with the host via a postMessage bridge. Developers provide callback functions (`getDefaultChartConfig`, `getQueriesFromChartConfig`, `renderChart`) and the SDK handles the lifecycle — initialization handshake, data fetching, config validation, re-rendering on updates.

Consumers install the SDK (`npm install @thoughtspot/ts-chart-sdk`), wire up their chart library (Muze, Highcharts, D3, Chart.js, etc.), and deploy to a URL that ThoughtSpot loads in an iframe.

## How It Runs

### File Structure

```
src/
├── index.ts                          # Barrel export — public API surface
├── main/
│   ├── custom-chart-context.ts       # Core class: CustomChartContext (event orchestration, lifecycle)
│   ├── post-message-event-bridge.ts  # postMessage transport layer (send/receive via promise-postmessage)
│   ├── logger.ts                     # Debug logger (enabled via ?debug=true query param)
│   └── util.ts                       # Helpers: timeout(), getQueryParam()
├── types/
│   ├── common.types.ts               # ChartModel, ChartConfig, QueryData, AppConfig, ValidationResponse
│   ├── chart-to-ts-event.types.ts    # ChartToTSEvent enum + payload map (SDK → ThoughtSpot)
│   ├── ts-to-chart-event.types.ts    # TSToChartEvent enum + payload map (ThoughtSpot → SDK)
│   ├── visual-prop.types.ts          # Visual property editor definitions (toggles, radios, dropdowns, sections)
│   ├── configurator.types.ts         # Chart config editor definitions (column sections, axes)
│   ├── answer-column.types.ts        # ChartColumn, ColumnType, DataType, ColumnFormat
│   ├── conditional-formatting.types.ts
│   ├── number-formatting.types.ts
│   └── actions.types.ts              # TS native action enums (drill down, filter, sort, etc.)
├── react/
│   ├── use-custom-chart-context.tsx   # useChartContext() React hook — manages lifecycle via useState/useEffect
│   ├── use-custom-chart-context.util.ts # Generates emitter/listener/offListener helpers from event enums
│   ├── use-custom-chart-types.ts      # ChartContextProps, TSChartContextProps, mapped event emitter types
│   └── mocks/                         # Mock context for React testing
├── utils/
│   ├── chart-config.ts               # Config validation + query column extraction
│   ├── formatting-util.ts            # getDataFormatter(), getBaseTypeFormatterInstance()
│   ├── date-formatting.ts            # formatDate(), formatDateNum() with luxon + custom calendars
│   ├── date-utils.ts                 # Bucket-to-format-pattern mapping, fiscal year helpers
│   ├── conditional-formatting/       # getCfForColumn() — evaluate conditional formatting rules against data
│   ├── number-formatting/            # formatNumber() — locale-aware number/currency/percentage formatting via globalize
│   └── globalize-Initializer/        # Globalize.js setup with CLDR data for i18n
└── test/                             # Shared test utilities and mock data builders
```

### Event-Driven Architecture

All communication between ThoughtSpot (host) and the custom chart (iframe) flows through a **postMessage bridge** (`post-message-event-bridge.ts`). The bridge uses `promise-postmessage` for request/response semantics — each message gets an acknowledgment.

There are two event directions:

-   **ChartToTSEvent** (SDK → ThoughtSpot): `OpenContextMenu`, `RenderStart`, `RenderComplete`, `UpdateVisualProps`, `ShowToolTip`, `GetDataForQuery`, `TrackChartInteraction`, etc.
-   **TSToChartEvent** (ThoughtSpot → SDK): `Initialize`, `InitializeComplete`, `ChartModelUpdate`, `DataUpdate`, `VisualPropsUpdate`, `TriggerRenderChart`, `GetDataQuery`, `ChartConfigValidate`, `VisualPropsValidate`, etc.

### Initialization Flow (First Render)

```
SDK (iframe)                         ThoughtSpot (host)
    │                                       │
    ├── InitStart ──────────────────────►   │  SDK signals it exists
    │                                       │
    │   ◄───────────────── Initialize ──────┤  Host sends ChartModel, AppConfig, componentId
    │                                       │
    │   SDK calls getDefaultChartConfig()   │
    │   SDK calls validateConfig()          │
    │   ◄──────────── validateVisualProp and validateChartConfig ─────────┤  Update the viusl prop on the sdk
    |   SDK call  getViusalPropEditorDefinition |
    │   SDK returns config + editor defs    │
    │                                       │
    │                                       │
    │   ◄──────────── GetDataQuery ─────────┤  Host asks for data queries
    │   SDK calls getQueriesFromChartConfig()│
    │   Returns query columns               │
    │   ◄──────────── DataUpdate ───────────┤  Host sends fetched data
    │   ◄──────────── validateVisualProp and validateChartConfig ─────────┤  Update the viusl prop on the sdk with data info.
    │   ◄────────── InitializeComplete ─────┤  Host confirms handshake done
    │                                       │
    │   ctx.initialize() promise resolves   │
    │                                       │
    │                                       │
    │   ◄─────────── TriggerRenderChart ────┤  Host triggers render
    │   SDK calls renderChart(ctx)          │
    │                                       │
    ├── RenderComplete ─────────────────►   │  SDK signals render done
```

After initialization, the host sends `ChartModelUpdate`, `DataUpdate`, or `VisualPropsUpdate` events whenever the user modifies the chart. Each triggers a re-render cycle based on the flag.

### postMessage Structure

Messages sent via the bridge follow this shape:

```typescript
// SDK → Host
{
    componentId: string,      // Maps to the specific chart instance on the liveboard
    payload: { ... },         // Event-specific payload
    eventType: ChartToTSEvent,
    source: 'ts-chart-sdk',
}

// Host → SDK
{
    eventType: TSToChartEvent,
    payload: { ... },         // Event-specific payload (ChartModel, config, visual props, etc.)
}
```

The bridge has a 30-second timeout (`TIMEOUT_THRESHOLD`). Responses include a `hasError` flag — if true, the SDK throws the error.

### Utility Modules

-   **Number Formatting** (`utils/number-formatting/`): Locale-aware formatting via Globalize.js + CLDR data. Handles currency, percentage, custom formats, negative value display, and unit suffixes (K/M/B/T). Entry point: `formatNumber(value, columnFormat, formatConfig)`.
-   **Conditional Formatting** (`utils/conditional-formatting/`): Evaluates CF rules (value-based, range-based, percentile, top/bottom N) against data. Returns font/background styles. Entry point: `getCfForColumn(column, dataValue, chartModel)`.
-   **Date Formatting** (`utils/date-formatting.ts`): Formats date/datetime values using Luxon. Supports fiscal year offsets, custom calendars, time buckets (HOURLY → YEARLY), and 30+ format presets.
-   **Formatting Util** (`utils/formatting-util.ts`): Higher-level `getDataFormatter()` that picks the right formatter (date, dateNum, or pass-through) based on column type. Also `generateMapOptions()` for building locale + custom calendar config from AppConfig.

### React Integration (`src/react/`)

For React-based charts, the SDK provides `useChartContext()` — a hook that wraps `CustomChartContext` into React state. It:

1. Creates a `CustomChartContext` internally (consumer doesn't call `getChartContext()` directly)
2. Manages `chartModel`, `appConfig`, `hasInitialized` as React state
3. Auto-registers `ChartModelUpdate`, `DataUpdate`, `VisualPropsUpdate` listeners that trigger re-renders
4. Provides typed event emitters (`emitOpenContextMenu`, `emitRenderStart`, etc.) and listeners (`setOnChartModelUpdate`, etc.) via mapped types
5. Returns a `TSChartContext` wrapper component that uses React key-based re-rendering

## Things That Will Bite You

-   **Strict TypeScript**: `strict: true`, `noImplicitAny: true`, `noImplicitReturns: true` in tsconfig. Every code path must return, no implicit any.
-   **Single context only**: `CustomChartContext` throws `MultipleContextsNotSupported` if you try to create a second instance. The `globalThis.isInitialized` flag enforces this.
-   **30-second postMessage timeout**: If the host doesn't respond to an emitted event within 30s, the promise rejects. This can happen during slow data fetches.
-   **`any` is allowed by ESLint**: Despite strict TS, `@typescript-eslint/no-explicit-any` is turned off. You'll see `any` used liberally — especially in event payloads and logger.
-   **Event listener order matters**: `reverseEventExecutionOrder` flag controls FIFO vs LIFO execution of event listeners. Default is FIFO. When reversed, developer callbacks run first, then internal handlers update `chartModel` last.
-   **Custom chart context is the god class**: `custom-chart-context.ts` is ~1460 lines. It handles initialization, events, validation, action menus, and state. Read it carefully before modifying.
-   **Tests co-located**: Every source file has a matching `.spec.ts` beside it. `custom-chart-context.spec.ts` is 2271 lines.
-   **Browser-only**: The SDK directly accesses `window.parent`, `document.querySelector`, `window.location`. It cannot run in Node without jsdom.

## Code Conventions

-   **Types in `.types.ts` files**: All type definitions live in `src/types/`. Named `<domain>.types.ts`.
-   **Lodash used extensively**: Imported as `_` (e.g., `_.isEmpty()`, `_.isNil()`, `_.isFunction()`).
-   **Export at declaration**: `export` keyword on the type/interface/function directly — no separate export block.
-   **Kebab-case filenames**: `custom-chart-context.ts`, `date-formatting.ts`, `visual-prop.types.ts`.
-   **Co-located tests**: `foo.ts` → `foo.spec.ts` in the same directory.
-   **Sorted imports**: `simple-import-sort` plugin — no blank lines between import groups.
-   **File headers**: Every file has `@file`, `@author`, copyright comment block.
-   **`@version SDK: x.x.x | ThoughtSpot:`** tag on every public export.
-   **`interface` for object shapes, `type` for unions/aliases/functions**.
-   **`_` prefix for intentionally unused parameters** (e.g., `(_visualProps, _chartModel, activeColumnId) =>`).
-   **No `console.log`**: Use `create('name')` from `logger.ts` instead (`no-console: warn`).
-   **Promise hygiene enforced**: `promise/always-return` and `promise/catch-or-return` are errors.
