export const REGEX = /[\[\]\+\-\=;\()\\]/;

export function getRandColor(colorToAvoid = "#ffffff") {
  let color = colorToAvoid;
  while (color === colorToAvoid)
    color = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  return color;
}