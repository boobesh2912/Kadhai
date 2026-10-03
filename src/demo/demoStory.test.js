import { describe, expect, it } from 'vitest';
import { DEMO_PAGES, DEMO_TITLE, createDemoStory, paginate } from './demoStory.js';
import { SCENE_NAMES } from './Illustrations.jsx';
import { tokenize } from '../useTypewriter.js';

const options = { title: 'A man and his car', storyType: 'adventure', length: 'medium', tone: 'funny' };

describe('demo story content', () => {
  it('is a medium-length story (the backend defines medium as about 300-450 words)', () => {
    const words = DEMO_PAGES.map((p) => p.text).join(' ').split(/\s+/).length;
    expect(words).toBeGreaterThanOrEqual(300);
    expect(words).toBeLessThanOrEqual(450);
  });

  it('has five pages, each with an existing illustration', () => {
    expect(DEMO_PAGES).toHaveLength(5);
    for (const page of DEMO_PAGES) expect(SCENE_NAMES).toContain(page.scene);
  });

  it('has a sample title', () => {
    expect(DEMO_TITLE).toBe('A man and his car');
  });
});

describe('createDemoStory', () => {
  it('resolves with the sample story under the title the visitor typed', async () => {
    const story = await createDemoStory({ ...options, title: 'My own title' }, undefined, 5);
    expect(story.title).toBe('My own title');
    expect(story.demo).toBe(true);
    expect(story.pages).toEqual(DEMO_PAGES);
    expect(story.text).toBe(DEMO_PAGES.map((p) => p.text).join('\n\n'));
  });

  it('waits for the delay before resolving', async () => {
    const started = Date.now();
    await createDemoStory(options, undefined, 60);
    expect(Date.now() - started).toBeGreaterThanOrEqual(50);
  });

  it('rejects with AbortError when aborted while waiting', async () => {
    const controller = new AbortController();
    const promise = createDemoStory(options, controller.signal, 5000);
    controller.abort();
    await expect(promise).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('rejects immediately if already aborted', async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(createDemoStory(options, controller.signal, 5000)).rejects.toMatchObject({ name: 'AbortError' });
  });
});

describe('paginate (real stories)', () => {
  it('groups paragraphs two per page', () => {
    const pages = paginate('One.\n\nTwo.\n\nThree.\nFour.\n\nFive.');
    expect(pages.map((p) => p.text)).toEqual(['One.\n\nTwo.', 'Three.\n\nFour.', 'Five.']);
  });

  it('never returns an empty book', () => {
    expect(paginate('Just one block of text.')).toEqual([{ text: 'Just one block of text.' }]);
    expect(paginate('')).toHaveLength(1);
  });
});

describe('tokenize (typing effect)', () => {
  it('splits into words that keep their trailing whitespace, so joining restores the text', () => {
    const text = 'Meet Harold.\n\nHe had a car.';
    const tokens = tokenize(text);
    expect(tokens).toEqual(['Meet ', 'Harold.\n\n', 'He ', 'had ', 'a ', 'car.']);
    expect(tokens.join('')).toBe(text);
  });

  it('handles empty text', () => {
    expect(tokenize('')).toEqual([]);
  });
});
