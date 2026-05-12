/**
 * Phase 6 D-09: route-local helper that derives the press credit list
 * from `videos.json`. Returns groups in the locked prestige order (D-10).
 *
 * Underscore prefix excludes this file from SvelteKit route detection
 * (matches Phase 5 `_pbsCollectionUrl.ts` pattern; SvelteKit 2.59.1 ignores
 * `_*` files under src/routes/*).
 *
 * Source: D-08 filter — `videos.filter(v => v.uploader !== 'Michelle Ngo')`
 * returns the 13 non-Michelle records (audit-verified at plan time;
 * each distinct uploader has exactly 1 credit today).
 *
 * Why pure function (not memoized): `videos` is a module-scoped readonly
 * array; calls are cheap and only happen at build time (prerender). No
 * runtime caching needed.
 *
 * Future-proofing: if a future `videos.json` row carries an uploader not
 * in PRESTIGE_ORDER, that group is appended at the end in insertion
 * order (no crash, no silent drop).
 */
import { videos, type Video } from '$lib/data';

/** D-10 prestige order. Hand-tuned for hiring-producer scan signal. */
const PRESTIGE_ORDER = [
  'HBO Max',
  'HBO',
  'PBS',
  'ABC News',
  'U2',
  'Amazon News',
  'Music Box Films',
  'Monument Releasing',
  'Cargo Film & Releasing',
  'AZPM',
  'HBODocs',
  'GrasshalmClips',
  'Lenny Cooke (Movie)',
] as const;

export interface PressGroup {
  network: string;
  videos: Video[];
}

export function getPressCredits(): PressGroup[] {
  // D-08 filter: drop Michelle Ngo's own uploads (her credits surface
  // elsewhere on the site; /press is for broadcast partners only).
  const pressVideos = videos.filter((v) => v.uploader !== 'Michelle Ngo');

  // Group by uploader (uploader string verbatim per D-09 — no normalization).
  const byNetwork = new Map<string, Video[]>();
  for (const v of pressVideos) {
    const list = byNetwork.get(v.uploader);
    if (list) {
      list.push(v);
    } else {
      byNetwork.set(v.uploader, [v]);
    }
  }

  // Emit in PRESTIGE_ORDER first, then append any unknown uploaders in
  // insertion order. Defensive future-proofing per JSDoc note above.
  const ordered: PressGroup[] = [];
  const consumed = new Set<string>();
  for (const network of PRESTIGE_ORDER) {
    const list = byNetwork.get(network);
    if (list && list.length > 0) {
      ordered.push({ network, videos: list });
      consumed.add(network);
    }
  }
  for (const [network, list] of byNetwork) {
    if (!consumed.has(network)) {
      ordered.push({ network, videos: list });
    }
  }
  return ordered;
}
