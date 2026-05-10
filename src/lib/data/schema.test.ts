import { describe, expect, it } from 'vitest';
// NOTE: imports for ./schema and ./categories are lazy (`await import(...)`) inside each
// `it()` body so this file loads cleanly in Wave 0 even though those modules don't exist
// yet. Vitest collects skipped describe blocks without executing their `it()` bodies, so
// the dynamic imports never run in Wave 0. Plan 02-01 creates ./schema.ts + ./categories.ts
// and removes `.skip` from these describe blocks to turn the suite RED→GREEN.

const validRecord = {
  source: 'vimeo',
  id: '264677021',
  title: 'Producer Reel',
  uploader: 'Michelle Ngo',
  published: '2018-04-13',
  thumbnail: 'https://example.com/t.jpg',
  embed: 'https://player.vimeo.com/video/264677021',
  category: 'Reel',
} as const;

describe.skip('schema accepts valid records', () => {
  it('canonical schema accepts a valid record', async () => {
    const { VideoSchema } = await import('./schema');
    expect(VideoSchema.safeParse(validRecord).success).toBe(true);
  });

  it('optional fields (duration_seconds, description) parse when absent', async () => {
    const { VideoSchema } = await import('./schema');
    const result = VideoSchema.safeParse(validRecord);
    expect(result.success).toBe(true);
  });

  it('accepts all 8 canonical categories', async () => {
    const { VideoSchema } = await import('./schema');
    const { CATEGORIES } = await import('./categories');
    for (const cat of CATEGORIES) {
      const r = VideoSchema.safeParse({ ...validRecord, category: cat });
      expect(r.success, `category ${cat} should parse`).toBe(true);
    }
  });
});

describe.skip('schema rejects bad data', () => {
  it('rejects a missing required field', async () => {
    const { VideoSchema } = await import('./schema');
    const bad: Record<string, unknown> = { ...validRecord };
    delete bad.title;
    expect(VideoSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects a non-ISO date', async () => {
    const { VideoSchema } = await import('./schema');
    expect(VideoSchema.safeParse({ ...validRecord, published: '04/13/2018' }).success).toBe(false);
  });

  it('rejects an unknown category', async () => {
    const { VideoSchema } = await import('./schema');
    expect(
      VideoSchema.safeParse({ ...validRecord, category: 'PBS American Portraits' }).success
    ).toBe(false);
  });

  it('rejects an unknown extra field', async () => {
    const { VideoSchema } = await import('./schema');
    expect(VideoSchema.safeParse({ ...validRecord, evil_extra: true }).success).toBe(false);
  });

  it('rejects an empty title', async () => {
    const { VideoSchema } = await import('./schema');
    expect(VideoSchema.safeParse({ ...validRecord, title: '' }).success).toBe(false);
  });

  it('rejects an unknown source', async () => {
    const { VideoSchema } = await import('./schema');
    expect(VideoSchema.safeParse({ ...validRecord, source: 'tiktok' }).success).toBe(false);
  });
});

describe.skip('VideoArraySchema validates the canonical file', () => {
  it('parses an array of valid records', async () => {
    const { VideoArraySchema } = await import('./schema');
    const result = VideoArraySchema.safeParse([validRecord, validRecord]);
    expect(result.success).toBe(true);
  });
});
