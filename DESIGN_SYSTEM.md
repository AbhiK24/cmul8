# cmul8 Design System

> Auto-generated from landing page styles. Last updated: 2026-03-09

---

## Brand Identity

**Name**: cmul8 (pronounced "simulate")
**Tagline**: AI agents that think like your customers
**Model Family**: Sonder
**Platform**: Simulation Platform

---

## Colors

### Core Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg` | `#fafafb` | Page background |
| `--text-dark` | `#1a1a1a` | Primary text, headings, accents |
| `--text-gray` | `#888888` | Secondary text, descriptions |
| `--text-light` | `#ededed` | Borders, dividers |
| `--accent` | `#1a1a1a` | Buttons, CTAs |
| `--white` | `#ffffff` | Button text, light cards |

### Extended Palette

| Context | Value | Usage |
|---------|-------|-------|
| Dark card bg | `#141414` | Dark mode surfaces |
| Card shadow | `rgba(0,0,0,0.06)` | Subtle elevation |

### Color Philosophy
- Near-black and white dominance
- Minimal color - let content speak
- Gray for hierarchy, not decoration

---

## Typography

### Font Family
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
```

**Google Fonts Import**:
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
```

### Scale

| Element | Size | Weight | Letter-spacing |
|---------|------|--------|----------------|
| Hero heading | `clamp(2rem, 5.5vw, 3.75rem)` | 500 | -0.03em |
| Section heading | `clamp(2rem, 4vw, 3rem)` | 500 | -0.03em |
| Feature title | `1.5rem` | 500 | -0.02em |
| Body | `1rem` | 400 | normal |
| Small/labels | `0.875rem` | 500 | 0.1em (uppercase) |
| Nav | `0.9375rem` | 400 | normal |

### Line Heights
- Headings: `1.2`
- Body: `1.6` - `1.7`
- Tight: `1.3`

---

## Spacing

### Base Unit
`1rem` = 16px

### Common Values
| Token | Value | Usage |
|-------|-------|-------|
| `xs` | `0.5rem` | Tight gaps |
| `sm` | `1rem` | Component padding |
| `md` | `1.5rem` | Section gaps |
| `lg` | `3rem` | Section padding |
| `xl` | `4rem` | Major sections |
| `2xl` | `8rem` | Hero/CTA padding |

### Max Widths
- Content: `1200px`
- Features: `1000px`
- Hero text: `900px`

---

## Components

### Buttons

**Primary (CTA)**
```css
background: var(--accent);      /* #1a1a1a */
color: var(--white);
padding: 1rem 2.5rem;
border-radius: 3rem;
font-size: 1rem;
font-weight: 500;
```

**Secondary (Nav CTA)**
```css
padding: 0.625rem 1.25rem;
border-radius: 2rem;
font-size: 0.9375rem;
```

**Hover State**
```css
opacity: 0.85;
transform: translateY(-2px);
transition: transform 0.2s ease, opacity 0.2s ease;
```

### Cards

**Light Card**
```css
background: var(--white);
aspect-ratio: 4/3;
```

**Dark Card**
```css
background: #141414;
color: var(--white);
```

**Card Labels**
```css
position: absolute;
bottom: 1.5rem;
right: 1.5rem;
font-size: 0.875rem;
font-weight: 500;
opacity: 0.7;
```

### Navigation

- Fixed position, centered layout
- Logo + links + CTA in single row
- Background matches page (`--bg`)
- Mobile: hamburger menu at 768px

---

## Icons

### Style
- Stroke-based SVG
- `stroke-width: 1.5` or `2`
- `fill: none` (outline style)
- Monochrome (inherits `currentColor`)

### Sizes
| Context | Size |
|---------|------|
| Nav logo | 28x16 |
| Feature icons | 24x24 |
| Card labels | 16x16 |
| Favicon | 32x32 |

### Logo
Infinity symbol (∞) with arrow passing through - represents infinite reasoning loop.

```svg
<!-- Simplified logo concept -->
<svg viewBox="0 0 28 16">
  <!-- Two overlapping circles (infinity) -->
  <path d="M7 8c0-2.5 2-4.5 4.5-4.5S16 5.5 16 8s-2 4.5-4.5 4.5S7 10.5 7 8z"/>
  <path d="M12 8c0-2.5 2-4.5 4.5-4.5S21 5.5 21 8s-2 4.5-4.5 4.5S12 10.5 12 8z"/>
  <!-- Arrow passing through -->
  <line x1="1" y1="8" x2="27" y2="8" stroke-dasharray="2 2"/>
  <polygon points="25,6 27,8 25,10" fill="currentColor"/>
</svg>
```

---

## Animation

### Scroll Reveal
```css
.animate {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.animate.visible {
  opacity: 1;
  transform: translateY(0);
}
```

### Flip Words
```css
@keyframes flipWords {
  0% { opacity: 0; transform: translateY(80%); }
  3%, 17% { opacity: 1; transform: translateY(0); }
  20%, 100% { opacity: 0; transform: translateY(-80%); }
}
/* Duration: 12.5s, 5 words cycling */
```

### Hover Transitions
```css
transition: all 0.2s ease;
/* or */
transition: all 0.3s ease;
```

### Easing
- Default: `ease`
- Smooth reveals: `cubic-bezier(0.16, 1, 0.3, 1)`
- Flip animation: `cubic-bezier(0.4, 0, 0.2, 1)`

---

## Responsive Breakpoints

| Breakpoint | Target |
|------------|--------|
| `900px` | Tablet landscape |
| `768px` | Tablet portrait / Mobile |
| `480px` | Small mobile |

### Key Adjustments at 768px
- Nav: show hamburger, hide inline links
- Hero: reduce padding, font size
- Features: single column
- Cards: stack vertically

---

## Assets

### Files
```
/assets/
  icon-platform.svg      # Dashboard icon
  icon-sonder-models.svg # Neural network icon
  logo-infinity.svg      # Logo mark (if extracted)

/favicon.svg             # 32x32, dark bg with white infinity
```

### Favicon
```svg
<svg width="32" height="32" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#1a1a1a"/>
  <!-- White infinity symbol -->
</svg>
```

---

## Voice & Tone

- **Confident** - "Stop guessing. Start simulating."
- **Concise** - Short sentences, no fluff
- **Technical but accessible** - AI concepts made tangible
- **Action-oriented** - Verbs: predict, explore, test, optimize, ship

---

## Do's and Don'ts

**Do**
- Use plenty of whitespace
- Keep text minimal
- Let visuals breathe
- Use subtle hover states

**Don't**
- Add decorative elements
- Use multiple accent colors
- Over-animate
- Add background textures/noise

---

## CSS Variables (Copy-Paste)

```css
:root {
  --bg: #fafafb;
  --text-dark: #1a1a1a;
  --text-gray: #888;
  --text-light: #ededed;
  --accent: #1a1a1a;
  --white: #fff;
  --card-shadow: 0 2px 40px rgba(0, 0, 0, 0.06);
}
```
