import vercelJson from '../../../vercel.json?raw';

import { APP_PAGE } from './pages';

type VercelConfig = {
  cleanUrls?: boolean;
  rewrites: { source: string; destination: string }[];
};

const config = JSON.parse(vercelJson) as VercelConfig;

describe('vercel.json', () => {
  it('rewrites the private routes to the app shell without .html when cleanUrls is on', () => {
    // With cleanUrls, a destination ending in .html finds no file and Vercel answers 404 (ADR 0041).
    expect(config.cleanUrls).toBe(true);
    expect(config.rewrites).toEqual([
      { source: '/(.*)', destination: `/${APP_PAGE.file.replace(/\.html$/, '')}` },
    ]);
  });
});
