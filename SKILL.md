---
name: murray-home-improvement-design
description: Use this skill to generate well-branded interfaces and assets for Murray Home Improvement (a licensed, insured, owner-operated residential remodeling & building general contractor in Chelmsford, MA), either for production or throwaway prototypes/mocks. Contains essential design guidelines, colors, type, fonts, assets, a Three.js hero engine, and homepage components for prototyping.
user-invocable: true
---

Read the `README.md` file within this skill, and explore the other available files.

Key files:
- `README.md` — company context, content fundamentals, visual foundations, iconography, manifest.
- `colors_and_type.css` — token source of truth (the ORIGINAL on-brand light system: blue #007bff on white).
- `assets/` — logo, favicon, real project photography, self-hosted Font Awesome 4.7.
- `preview/` — specimen cards for the Design System tab.
- `Murray Home Improvement.html` + `site/` — a modern, dark "architectural editorial" homepage
  concept: Murray blue as the single accent, a Three.js undulating cube-grid hero
  (`site/cubefield.js`), React components, and an in-page Tweaks panel.

There are two valid brand expressions, both documented:
1. **Classic** — bright blue (#007bff) on white, Roboto + Roboto Slab (matches the live site).
2. **Modern dark** — near-black grounds, Murray blue as one sharp accent, Space Grotesk
   display + Hanken Grotesk body (the homepage concept).

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out
and create static HTML files for the user to view. If working on production code, copy
assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build
or design, ask some questions (including which brand expression — classic light or modern
dark), and act as an expert designer who outputs HTML artifacts _or_ production code,
depending on the need.
