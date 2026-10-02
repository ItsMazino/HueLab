export const presets = [
  {
    name: "Terracotta afternoon",
    colors: ["#34483E", "#A4B494", "#F2E8CF", "#DE9E73", "#C45C3D"],
  },
  {
    name: "Sunday by the sea",
    colors: ["#173F4F", "#408A9E", "#A8CFCE", "#F4EFDF", "#E9B36C"],
  },
  {
    name: "After hours",
    colors: ["#272638", "#686387", "#B4A4BC", "#EFDFD1", "#DF8E6D"],
  },
  {
    name: "Market flowers",
    colors: ["#384F35", "#98AC83", "#EEE5CA", "#D8A0A0", "#AD4E63"],
  },
];
export function luminance(hex) {
  const rgb = hex
    .replace("#", "")
    .match(/.{2}/g)
    .map((v) => parseInt(v, 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}
export function contrast(a, b) {
  const x = luminance(a),
    y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
export const ink = (hex) =>
  contrast(hex, "#FFFFFF") > contrast(hex, "#17231B") ? "#FFFFFF" : "#17231B";
export const validHex = (value) => /^#[0-9a-f]{6}$/i.test(value);
export function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))))
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}
export function generateColors(colors, locks, random = Math.random) {
  const hue = random() * 360;
  return colors.map((c, i) =>
    locks[i]
      ? c
      : hslToHex(
          (hue + [0, 20, 35, 165, 180][i]) % 360,
          22 + random() * 30,
          [23, 48, 90, 72, 42][i],
        ),
  );
}
export const cssExport = (colors) =>
  `:root {\n${colors.map((color, i) => `  --color-${i + 1}: ${color};`).join("\n")}\n}\n`;
