// handling genome compression/decompression
// saves drawing parameters in b64
function compressDrawing(genome) {
  const json = JSON.stringify(genome);
  return btoa(encodeURIComponent(json));
}

function decompressDrawing(encoded) {
  const json = decodeURIComponent(atob(encoded));
  return JSON.parse(json);
}