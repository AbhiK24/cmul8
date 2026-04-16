# CMUL8 — Frontend Spec v2.0
## Chat-first interface. Think Claude/ChatGPT with simulation superpowers.

---

## Core Concept

One screen. A chat thread. A smart input bar at the bottom.
The mode dropdown changes what the message does.
Everything else (cohort, attach, env) are options within that bar.

---

## Layout

```
┌─────────────────────────────────────────────────────┐
│  TOP NAR                                            │
│  [≡]  CMUL8  ·  NZTA Road Policy          [Avatar] │
├──────────┬──────────────────────────────────────────┤
│          │                                          │
│  HISTORY │                                          │
│  ──────  │         CHAT THREAD                      │
│  Past    │         (messages scroll here)           │
│  convers │                                          │
│  ations  │                                          │
│  like    │                                          │
│  Claude  │                                          │
│  sidebar │                                          │
│          │                                          │
│          ├──────────────────────────────────────────┤
│          │  INPUT BAR                               │
│          │  ┌────────────────────────────────────┐  │
│          │  │ Ask a question...                  │  │
│          │  └────────────────────────────────────┘  │
│          │  [📎] [Mode ▾] [Cohort ▾] [Env ▾]  [▶] │
└──────────┴──────────────────────────────────────────┘
```

---

## Left Sidebar

Identical to Claude's sidebar. No context menus or collapsible sections.

- **Top:** `+ New Chat` button
- **Below:** List of past conversations, grouped by date — `Today`, `Yesterday`, `Last 7 days`
- Each entry: first message truncated as title + mode badge (`POLL` / `ASK` / `SIM`) in small colour tag
- Click → loads that conversation thread into the centre
- Hover → shows `⋯` menu with Rename / Delete
- Sidebar collapsible via `≡` hamburger in top nav

---

## Top Nav

Minimal. One line.

```
[≡]   CMUL8   ·   NZTA Road Policy ▾         [● Live]  [Avatar]
```

- `≡` — toggles sidebar
- `NZTA Road Policy ▾` — workspace switcher dropdown. Shows all workspaces + `+ New Workspace`
- `● Live` — green pulsing dot when agents are active/warm. Grey when idle.
- `Avatar` — profile + settings

---

## Input Bar

The heart of the UI. Lives at the bottom, always visible.
Looks like Claude's composer but with 3 extra controls on the toolbar below the text field.

```
┌─────────────────────────────────────────────────────────┐
│  Ask a question, run a poll, or describe a policy...    │
└─────────────────────────────────────────────────────────┘
  [📎 Attach]  [Mode: Poll ▾]  [Cohort: NZTA Drivers V1 ▾]  [Env: District 7 ▾]  ──────  [▶ Send]
```

### 📎 Attach
- Icon button. Opens file picker.
- Accepts: images, PDFs, CSVs
- Once attached, shows a thumbnail chip above the input field with × to remove
- Attached files become visual stimuli passed to agents (what they "see")
- Multiple attachments allowed — show as a horizontal chip row

### Mode ▾ (dropdown)
Four options:

| Option | What it does |
|---|---|
| **Poll** | Sends the question to selected agent cohort. Returns per-agent responses + synthesis. |
| **Ask ENV** | RAG query against loaded environment datasets. Returns grounded insight + source citation. |
| **Simulation** | Opens sim config inline. Question becomes the policy scenario description. |
| **Extract** | Pulls structured data / JSON from the active env or agent context. |

Selected mode label shows in the button. Colour coded:
- Poll = amber
- Ask ENV = jade/teal
- Simulation = violet
- Extract = slate

### Cohort ▾ (dropdown)
- Shows list of available cohorts + their active version
- Each option: `Cohort name (N agents) · V1` with a small version badge
- Multi-select allowed — check multiple cohorts to poll all of them
- Option at bottom: `+ Add Cohort`
- If none selected: button shows `No cohort` in muted text. Sending in Poll mode prompts user to select one.

### Env ▾ (dropdown)
- Shows list of loaded environment datasets
- Each option: dataset name + type chip (DEMO / ECON / GEO)
- Multi-select: check which datasets are active context for this message
- Option at bottom: `+ Upload Dataset`
- Selected count shown in button: `Env: 2 datasets`

### ▶ Send
- Primary action button. Jade background.
- Keyboard: `⌘ Enter`
- While processing: becomes a `◼ Stop` button (like Claude)

---

## Chat Thread — Message Types

### User message
Right-aligned (or left like Claude — match whichever). Standard bubble.
If attachments: thumbnail chips shown above the text.
Shows active mode as a small pill: `via Poll` / `via Ask ENV` etc.

---

### ENV response (Ask ENV mode)
Left-aligned. Jade left-border accent.

```
┌─ ENV ──────────────────────────────────────────────────────┐
│                                                            │
│  Median income in District 7 is $48,200, sitting 12%      │
│  below the national average. The lowest-income zone        │
│  (Zone 4) has a concentration of 34% lower-income         │
│  households with high car dependency (74% commute by car). │
│                                                            │
│  ┌─ inline bar chart if relevant ─────────────────────┐   │
│  │  Zone 4  ████████████████  74%  car dependency     │   │
│  │  Zone 7  ████████░░░░░░░░  52%                     │   │
│  │  Zone 2  ███████░░░░░░░░░  48%                     │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  Source: NZ Census 2024 · District 7                       │
└────────────────────────────────────────────────────────────┘
```

---

### Poll response (Poll mode)
Left-aligned. Full-width card. Amber left-border accent.

```
┌─ POLL RESULTS ─────────────────────────────────────────────┐
│  "Would you support a congestion charge in exchange for    │
│   improved public transit?"                                │
│  Cohorts: NZTA Drivers V1 (6) · NZTA Non-Drivers V1 (4)  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  👤 Daily Commuter                      Confidence  88%   │
│  ─────────────────────────────────────────────────────     │
│  "I already pay through the nose for fuel. Unless          │
│   the buses actually run on time, I'm not paying more."    │
│                                                            │
│  Reasoning ▾                                               │
│  Prioritises cost certainty, low trust in transit.         │
│  Drivers: [income_pressure] [transit_distrust]             │
│           [daily_car_dependency]  ← clickable chips        │
│  NZTA Drivers · V1  ·  ⚠ outlier vs cohort               │
│                                                            │
│  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  │
│                                                            │
│  👤 Retired Resident                    Confidence  72%   │
│  "Better buses would mean I don't need my son to           │
│   drive me around. I'd pay a small charge for that."       │
│  ...                                                       │
│                                                            │
├─ SYNTHESIS ────────────────────────────────────────────────┤
│  6/10 opposed. Primary friction: cost + low transit        │
│  trust. Non-drivers more supportive (7/10). Key fault      │
│  line: belief that transit will actually improve.          │
│                                                            │
│  [Export JSON]  [Ask a follow-up →]                       │
└────────────────────────────────────────────────────────────┘
```

**Agent card anatomy (direct from Simile screenshot pattern):**
- Header: persona icon + archetype name · `Confidence XX%` badge right-aligned
- Body: verbatim first-person response in body font, medium weight
- `Reasoning ▾` — collapsed by default, expand to see:
  - Prose behavioural explanation
  - Driver chips — coloured, clickable (click = filter all cards to agents sharing this driver)
  - If ENV features drove the response: reference them inline e.g. `median_income: $48k`
- Footer: `cohort_name · vX` · `⚠ outlier` badge in rose if response diverges from cohort median

**If attachment was included:** Small `👁 Visual stimulus attached` flag on the results card header.

---

### Simulation response (stub for now)
Left-aligned. Violet left-border accent.

```
┌─ SIMULATION ───────────────────────────────────────────────┐
│  Configure your simulation run                             │
│                                                            │
│  Scenario:  [user's message used as description]           │
│  Env:       District 7  ✓                                  │
│  Agents:    NZTA Drivers V1 + Non-Drivers V1  ✓            │
│  Policy:    [+ Add lever]  ○                               │
│  Model:     [Nash ▾]  ○                                    │
│                                                            │
│  [ Launch Simulation → ]  (enabled when all ✓)             │
└────────────────────────────────────────────────────────────┘
```

---

## Empty / First-run State

When no conversation exists yet:

Centre of screen shows:
```
                    CMUL8
           What would you like to simulate?

   [Poll your agents]  [Ask your environment]  [Run a scenario]
```

Three suggestion chips that pre-fill the input with example prompts.
Same pattern as Claude/ChatGPT empty state.

---

## Cohort Version Handling

The `Cohort ▾` dropdown shows versions inline:

```
☑  NZTA Drivers          V1 ▾   (6 agents)
☑  NZTA Non-Drivers      V1 ▾   (4 agents)
☐  Urban Workers         V2 ▾   (12 agents)

+ Add Cohort
```

The `V1 ▾` next to each cohort is its own mini-dropdown:
- Shows all available versions for that cohort: V1, V2, V3...
- Selecting V2 swaps which snapshot is used for the next interaction
- Active version shows in the button label: `Cohort: 2 selected`

---

## Mock Data (`/lib/mockData.ts`)

```typescript
export const workspaces = [
  { id: "ws1", name: "NZTA Road Policy" },
  { id: "ws2", name: "Urban Housing Sim" },
]

export const cohorts = [
  {
    id: "c1", name: "NZTA Drivers", agentCount: 6,
    versions: ["V1", "V2"],
    agents: [
      { id: "a1", name: "Daily Commuter", confidence: 88,
        response: "I already pay through the nose for fuel. Unless the buses actually run on time, I'm not paying more.",
        reasoning: "Prioritises cost certainty, low trust in transit reliability.",
        drivers: ["income_pressure", "transit_distrust", "daily_car_dependency"],
        isOutlier: true, cohort: "NZTA Drivers", version: "V1" },
      { id: "a2", name: "Rural Tradesperson", confidence: 79,
        response: "No public transit reaches my worksite. This charge would just cost me money with zero benefit.",
        reasoning: "Car-dependent by necessity, not preference. Policy has no upside for this persona.",
        drivers: ["rural_dependency", "zero_transit_access", "cost_sensitivity"],
        isOutlier: false, cohort: "NZTA Drivers", version: "V1" },
    ]
  },
  {
    id: "c2", name: "NZTA Non-Drivers", agentCount: 4,
    versions: ["V1"],
    agents: [
      { id: "a3", name: "Retired Resident", confidence: 72,
        response: "Better buses would mean I don't need my son to drive me around. I'd pay a small charge for that.",
        reasoning: "Transit-dependent. Values independence. Willing to accept cost if service quality improves.",
        drivers: ["transit_dependency", "independence_value", "income_fixed"],
        isOutlier: false, cohort: "NZTA Non-Drivers", version: "V1" },
    ]
  }
]

export const datasets = [
  { id: "d1", name: "NZ Census 2024", type: "DEMO", status: "indexed", records: 142000 },
  { id: "d2", name: "NZTA Traffic Flow Q1-25", type: "GEO", status: "indexed", records: 8400 },
  { id: "d3", name: "Household Income Survey", type: "ECON", status: "processing", records: 22000 },
]

export const mockEnvResponse = {
  text: "Median income in District 7 is $48,200, sitting 12% below the national average. Zone 4 has the highest car dependency at 74%.",
  chart: { type: "bar", data: [
    { zone: "Zone 4", value: 74 },
    { zone: "Zone 7", value: 52 },
    { zone: "Zone 2", value: 48 },
  ]},
  source: "NZ Census 2024 · District 7"
}

export const mockSynthesis = "6/10 agents opposed. Primary friction: cost + low transit trust. Non-drivers more supportive (7/10). Key fault line: belief that transit will actually improve."

export const conversationHistory = [
  { id: "ch1", title: "Congestion charge response", mode: "POLL", date: "Today" },
  { id: "ch2", title: "Income distribution Zone 4", mode: "ASK", date: "Today" },
  { id: "ch3", title: "Housing subsidy scenario", mode: "SIM", date: "Yesterday" },
]
```

---

## Build Order for Claude Code

```
1. Shell          — top nav + collapsible sidebar + chat area + input bar (static)
2. Sidebar        — conversation history list, grouped by date, + New Chat
3. Input bar      — text field + 4 icon/dropdown controls + send button
4. Empty state    — centred logo + 3 suggestion chips
5. Ask ENV mode   — mock streaming response with inline chart
6. Poll mode      — results card with agent cards + reasoning + synthesis
7. Cohort dropdown — multi-select with inline version picker
8. Attach         — file chip preview above input
9. Simulation stub — inline config card
```

---

## Prompt for Claude Code

> Build a Next.js 14 App Router app called CMUL8. It's a chat interface — think Claude or ChatGPT — but the input bar has 3 extra controls: a Mode dropdown (Poll / Ask ENV / Simulation / Extract), a Cohort multi-select dropdown with inline version pickers, and an Env dataset dropdown. Left sidebar shows conversation history. All data is mocked from `/lib/mockData.ts`. No backend. Style with Tailwind + shadcn/ui. Use Framer Motion for message fade-in. Use Recharts for inline charts in ENV responses. The main colour theme is dark (#09090b background) with jade (#00e5a0) as the primary accent. Fonts: Syne for headings, JetBrains Mono for labels and badges.
