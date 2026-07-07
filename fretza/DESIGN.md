---
name: FRETZA
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#5a4136'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#8e7164'
  outline-variant: '#e2bfb0'
  surface-tint: '#a04100'
  primary: '#a04100'
  on-primary: '#ffffff'
  primary-container: '#ff6b00'
  on-primary-container: '#572000'
  inverse-primary: '#ffb693'
  secondary: '#5d5f5f'
  on-secondary: '#ffffff'
  secondary-container: '#dfe0e0'
  on-secondary-container: '#616363'
  tertiary: '#555f6f'
  on-tertiary: '#ffffff'
  tertiary-container: '#909aab'
  on-tertiary-container: '#283240'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbcc'
  primary-fixed-dim: '#ffb693'
  on-primary-fixed: '#351000'
  on-primary-fixed-variant: '#7a3000'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#d9e3f6'
  tertiary-fixed-dim: '#bdc7d9'
  on-tertiary-fixed: '#121c2a'
  on-tertiary-fixed-variant: '#3d4756'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  display-lg:
    fontFamily: Lexend
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Lexend
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Lexend
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Lexend
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 64px
  max-width: 1280px
---

## Brand & Style
The design system for this hyperlocal platform is built on the pillars of **velocity, freshness, and local reliability**. It captures a "Modern Startup" aesthetic that prioritizes speed and trust, specifically tailored for the Khunta region. 

The visual language balances high-energy action with premium cleanliness. We employ a **Modern Corporate** foundation infused with **Glassmorphism** for navigational overlays to create a sense of depth and technical sophistication. The emotional response should be one of "effortless reliability"—the user feels that their needs are being met with precision and local care. The interface utilizes generous whitespace and high-contrast focal points to guide users through the ordering funnel with zero friction.

## Colors
The palette is dominated by **Primary Orange (#FF6B00)**, chosen to stimulate appetite and convey a sense of urgency and warmth. This is supported by a clean **Secondary White** for high-clarity surfaces.

### Color Application
- **Primary:** Used for key actions (CTAs), delivery tracking status, and critical brand touchpoints.
- **Surface & Background:** In light mode, we use a tiered gray system (#F9FAFB) to separate content sections. In dark mode, surfaces shift to deep charcoals to maintain contrast with the primary orange.
- **Functional Colors:** Success (Green) for completed orders and Error (Red) for stock-outs or payment issues follow standard accessibility patterns.

## Typography
We use a dual-font strategy to balance character with utility. 

- **Lexend** is utilized for headlines and display text. Its geometric clarity and varied widths improve readability for price points and restaurant titles, providing a friendly yet modern "tech" feel.
- **Inter** handles all body copy, forms, and technical metadata. It is selected for its exceptional legibility at small sizes, crucial for ingredient lists and delivery instructions.

**Scale Strategy:** Headlines shift significantly on mobile to ensure the "Add to Cart" flow remains above the fold. Tracking is slightly tightened on Display styles to maintain a punchy, editorial look.

## Layout & Spacing
The layout follows a **Fluid Grid** model with a hard 4px baseline shift. 

- **Mobile:** A 4-column system with 16px margins. Components like food categories use horizontal "overflow" scrolling to maximize vertical real estate.
- **Desktop:** A 12-column grid with a 1280px max-width. Sidebars are used for persistent cart visibility and filter controls.
- **Spacing Rhythm:** Use `md` (16px) for internal component padding and `lg` (24px) for vertical section stacking. This creates a "breathable" layout that feels premium rather than cluttered.

## Elevation & Depth
This design system utilizes **Tonal Layering** combined with **Glassmorphism** to establish hierarchy.

1.  **Level 0 (Background):** Neutral Light Gray (#F9FAFB).
2.  **Level 1 (Cards):** Pure White with a subtle 1px border (#E5E7EB) and a soft ambient shadow (Y: 4, Blur: 12, Opacity: 0.05).
3.  **Level 2 (Overlays/Floating):** Use Backdrop Blurs (20px) with 80% opacity white. This is specifically for bottom sheets (mobile) and sticky headers.
4.  **Interaction:** Buttons should use a subtle inner-glow on hover to simulate tactile feedback. Shadows increase in spread (Y: 8, Blur: 20) when a card is dragged or active.

## Shapes
The shape language is defined by **pronounced, friendly curves**. 

- **Containers:** All food item cards and restaurant banners use `rounded-2xl` (1rem / 16px).
- **Buttons:** Large action buttons use `rounded-xl` (12px) to feel substantial.
- **Search Bars:** These follow a pill-shaped `rounded-full` treatment to distinguish them as the primary entry point for the user journey.
- **Icons:** Use a 2px stroke weight with rounded caps to match the typography's softness.

## Components

### Buttons
- **Primary:** Solid Orange (#FF6B00) with White text. Bold weight.
- **Secondary:** White background with Orange border and text.
- **State:** Pressed states should darken the orange by 10%.

### Input Fields
- Use a soft gray fill (#F3F4F6) with no border in its default state. 
- On focus, transition to a White background with a 2px Primary Orange border.

### Chips (Categories)
- Pill-shaped with a light orange tint (#FFF7ED) and orange text for the "Active" state. 
- Default state: Light gray background with dark gray text.

### Cards
- **Restaurant Cards:** Feature a full-bleed image at the top with a 16px padding container for text below. 
- **Delivery Progress:** Use a glassmorphic floating bar at the bottom of the screen with a blurred background to keep the map visible.

### Lists
- Use generous 16px vertical padding between items with a light divider (#F1F5F9). 
- Avoid boxed containers for lists to maintain a clean, airy feel.