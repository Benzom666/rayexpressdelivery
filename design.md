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
- Home: still hero copy beside real courier footage, scrolling partner logo rail, service grid, editorial Canada coverage map, special handling, process and contact CTA.
- Content pages: photographic hero, clear section sequence, shared header and footer.
- Contact: direct details and a quote form that opens a prefilled email draft.

## Motion
- No text reveal animation. The hero uses a short real delivery video that pauses offscreen or when reduced motion is requested.
- Partner logos move in a continuous rail, pause on hover, and become a stationary list for reduced-motion visitors.
- The coverage map shows one illustrative warehouse → pickup → delivery journey using a restrained moving van. Motion pauses offscreen and when the document is hidden; reduced-motion visitors see a static route.
- Hover and press feedback use short transform or colour transitions only.

## Map and claims
- Leaflet and local Natural Earth country and province boundaries provide the free interactive geographic map with visible attribution.
- City labels are geographic references. The three route stops and van position are illustrative, not depot locations or live tracking.
- Route availability and timing are discussed per request.
- Regulated goods are discussed only where permitted and with the required authorizations.
