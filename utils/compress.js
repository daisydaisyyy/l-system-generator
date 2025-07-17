// handling genome compression/decompression

function compressGenome(genome) {
  const json = JSON.stringify(genome);
  return btoa(encodeURIComponent(json));
}

function decompressGenome(encoded) {
  const json = decodeURIComponent(atob(encoded));
  return JSON.parse(json);
}