// Built-in sample content used in demo mode (no Gemini key needed).
//
// Whatever options the visitor picks, demo mode "generates" this funny, medium-length
// story. The title shown is the one the visitor typed.

export const DEMO_TITLE = 'A man and his car';

// `scene` picks the matching illustration in ./Illustrations.jsx.
export const DEMO_PAGES = [
  {
    scene: 'street',
    text:
      'Meet Harold. Harold owned exactly one car: a small, round, slightly dented hatchback named Gertrude. ' +
      'Every morning Harold patted her roof and said, "Today is going to be a good day." ' +
      'Gertrude, who had strong opinions, answered with a cough, a rattle, and a puff of smoke shaped like a sneeze. ' +
      'The neighbours said she was older than the street. Harold said she was simply "vintage," ' +
      'and Gertrude, who could hear everything, squeaked in agreement.',
  },
  {
    scene: 'honk',
    text:
      'One Monday, Gertrude refused to start. Harold turned the key. Nothing. He turned it again. Nothing. ' +
      'He said "please." Gertrude honked all by herself, as if to say, "Not before breakfast." ' +
      'So Harold ran inside, came back with a banana, and set it on the dashboard. The engine purred like a happy cat. ' +
      'Harold decided never to ask how.',
  },
  {
    scene: 'road',
    text:
      'Off they went, bumping down Maple Street. Gertrude had only one speed: dramatic. ' +
      'She took corners like a pirate ship and stopped at green lights just to enjoy the view. ' +
      'A pigeon overtook them. Then a jogger. Then a very slow snail named Colin, who waved. Harold waved back politely. ' +
      'The radio only played one station, and only static, but Harold sang along anyway and called it "experimental jazz."',
  },
  {
    scene: 'market',
    text:
      'Harold had come to the supermarket for exactly one thing: bread. ' +
      'He squeezed Gertrude into a tiny parking space, and her bumper fell off with a loud clang. ' +
      'Everyone turned to stare. Harold picked it up, bowed deeply, and announced, ' +
      '"Ladies and gentlemen, the car is lighter now. Fuel efficiency!" The crowd clapped. Somebody even gave him a coupon.',
  },
  {
    scene: 'night',
    text:
      'That evening, Harold tied the bumper back on with his best scarf and parked Gertrude under the stars. ' +
      '"You\'re not fast," he told her. "You\'re not pretty. But you\'re mine." ' +
      'Gertrude\'s headlights blinked twice, and her engine let out a tiny, sleepy sigh. ' +
      'And they lived bumpily ever after. The End.',
  },
];

export const DEMO_DELAY_MS = 3200;

// Pretends to call the AI: waits a moment, then resolves with the sample story.
// Same shape as the real /api/story response, plus `pages` for the book.
export function createDemoStory(options, signal, delayMs = DEMO_DELAY_MS) {
  return new Promise((resolve, reject) => {
    const abort = () => {
      clearTimeout(timer);
      reject(Object.assign(new Error('aborted'), { name: 'AbortError' }));
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', abort);
      resolve({
        title: options.title,
        text: DEMO_PAGES.map((p) => p.text).join('\n\n'),
        pages: DEMO_PAGES,
        demo: true,
      });
    }, delayMs);
    if (signal?.aborted) return abort();
    signal?.addEventListener('abort', abort, { once: true });
  });
}

// Splits a real story into book pages of up to `perPage` paragraphs each.
export function paginate(text, perPage = 2) {
  const paragraphs = text.split(/\n+/).map((p) => p.trim()).filter(Boolean);
  const pages = [];
  for (let i = 0; i < paragraphs.length; i += perPage) {
    pages.push({ text: paragraphs.slice(i, i + perPage).join('\n\n') });
  }
  return pages.length ? pages : [{ text }];
}
