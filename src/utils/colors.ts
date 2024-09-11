export function parseHsl(hslString: string): [number, number, number] {
  // Entfernt "hsl(", ")" und trennt durch Kommas
  const hsl = hslString
    .replace(/hsl|\(|\)|%/g, '')
    .split(',')
    .map(Number);
  return [hsl[0], hsl[1], hsl[2]];
}

// Hilfsfunktion, um HSL in RGB zu konvertieren
export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0,
    g = 0,
    b = 0;

  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (300 <= h && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return [r, g, b];
}

// Hilfsfunktion, um RGB in HSL zu konvertieren
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (value: number) => {
    const hex = value.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Funktion, um die Farbskala zu erzeugen
export function generateHslColorScale(startHsl: string, endHsl: string, steps: number): string[] {
  const [startH, startS, startL] = parseHsl(startHsl);
  const [endH, endS, endL] = parseHsl(endHsl);

  const colorScale: string[] = [];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;

    const h = Math.round(startH + t * (endH - startH));
    const s = Math.round(startS + t * (endS - startS));
    const l = Math.round(startL + t * (endL - startL));

    const [r, g, b] = hslToRgb(h, s, l);
    colorScale.push(rgbToHex(r, g, b));
  }

  return colorScale;
}
