# Ray Express design system

## Purpose
A Canada-wide delivery brand. The visual language comes from the supplied van artwork: night asphalt, sky blue lettering and a warm orange vehicle.

## Theme
- Dark asphalt `--color-paper` with slightly lighter route panels `--color-paper-2` and `--color-card`.
- Orange `--color-accent` for actions, route movement and special delivery.
- Sky blue `--color-cyan` for labels, city markers and emphasis.
- Light ink and readable muted copy on dark surfaces. Design tokens live in `tokens.css`.

## Typography and spacing
- Space Grotesk for large headings and navigation.
- Manrope for body copy; IBM Plex Mono for compact map labels and operational details.
- Instrument Serif italic is limited to a short phrase in a headline.
- Use the named 4 point spacing scale in `tokens.css`.

## Pages
- Home: still hero copy beside real courier footage, service grid, interactive Canada map, special handling, process and contact CTA.
- Content pages: photographic hero, clear section sequence, shared header and footer.
- Contact: direct details and a quote form that opens a prefilled email draft.

## Motion
- No text reveal animation. The hero uses a short real delivery video that pauses offscreen or when reduced motion is requested.
- Illustrated vehicles move on national routes when the map enters view; they stop when out of view.
- Respect reduced motion and keep the map vehicle still for visitors who request it.
- Hover and press feedback use short transform or colour transitions only.

## Map and claims
- Leaflet and a local Natural Earth outline provide the free interactive map with visible attribution.
- The moving vehicle is expressly an illustration, not a live courier position.
- Canada markers show coverage cities; the map does not promise a depot or guaranteed timing in every city.
- Regulated goods are discussed only where permitted and with the required authorizations.
