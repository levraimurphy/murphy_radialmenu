// Static asset resolution (served from public/assets).
// Vite: import.meta.env.BASE_URL is './' (relative base) -> valid NUI paths.
const BASE = `${import.meta.env.BASE_URL ?? '/'}assets`;

export const img = (path) => `${BASE}/${path}`;

// Slot icon: the backend sends the file NAME, resolved here in /assets/icons.
// Accepts "hat" or "hat.png" (extension added if missing).
export const icon = (name) => {
  if (!name) return img('icons/_missing.png');
  const file = /\.[a-z0-9]+$/i.test(name) ? name : `${name}.png`;
  return img(`icons/${file}`);
};

// Wheel skin (game textures) in /assets/wheel.
export const wheelTex = (name) => img(`wheel/${name}`);
