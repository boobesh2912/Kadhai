import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiRequestError, createAudio, createImage, createStory } from './api.js';

const options = { title: 'The Moon Garden', storyType: 'space', length: 'short', tone: 'magical' };

function mockFetch(response) {
  const fn = vi.fn().mockResolvedValue(response);
  vi.stubGlobal('fetch', fn);
  return fn;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('createStory', () => {
  it('posts the options as JSON and returns the parsed body', async () => {
    const fetchMock = mockFetch(Response.json({ title: 'The Moon Garden', text: 'Once upon a time.' }));
    const story = await createStory(options);

    expect(story).toEqual({ title: 'The Moon Garden', text: 'Once upon a time.' });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/story');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual(options);
  });

  it('turns an API error body into an ApiRequestError', async () => {
    mockFetch(Response.json({ error: 'Title is required.', code: 'invalid_request' }, { status: 400 }));
    await expect(createStory(options)).rejects.toMatchObject({
      name: 'ApiRequestError',
      message: 'Title is required.',
      code: 'invalid_request',
      status: 400,
    });
  });

  it('gives a friendly message for a non-JSON gateway timeout', async () => {
    mockFetch(new Response('<html>timeout</html>', { status: 504 }));
    await expect(createStory(options)).rejects.toThrow('took too long');
  });

  it('reports network failures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    const error = await createStory(options).catch((e) => e);
    expect(error).toBeInstanceOf(ApiRequestError);
    expect(error.code).toBe('network');
  });

  it('lets aborts through untouched', async () => {
    const abort = Object.assign(new Error('aborted'), { name: 'AbortError' });
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abort));
    await expect(createStory(options)).rejects.toMatchObject({ name: 'AbortError' });
  });
});

describe('binary endpoints', () => {
  it('createImage and createAudio return object URLs for the blobs', async () => {
    const createObjectURL = vi.fn().mockReturnValue('blob:fake');
    vi.stubGlobal('URL', { createObjectURL });

    const fetchMock = mockFetch(new Response(new Blob(['x'], { type: 'image/png' })));
    expect(await createImage(options)).toBe('blob:fake');
    expect(fetchMock.mock.calls[0][0]).toBe('/api/image');

    mockFetch(new Response(new Blob(['y'], { type: 'audio/wav' })));
    expect(await createAudio('Hello')).toBe('blob:fake');
    expect(createObjectURL).toHaveBeenCalledTimes(2);
  });
});
