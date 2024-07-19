function artistsStr(artists) {
  let _str = ""
  for (let i = 0; i < artists.length; i++) {
    if (i > 0) {
      _str += artists.length > 2 ? ", " : " ";
      _str += i + 1 === artists.length ? "and " : "";
    }

    _str += artists[i].name
  }
  return _str;
}

function trackStr(track) {
  const artists = artistsStr(track.artists)
  const d = new Date(Date.UTC(0,0,0,0,0,0,track.duration_ms)),
  // Pull out parts of interest
  parts = [
    d.getUTCMinutes(),
    d.getUTCSeconds()
  ],
  // Zero-pad
  duration = parts.map(s => String(s).padStart(2,'0')).join(':');
  return `'${track.name}' by ${artists} (${duration})`
}

function albumStr(album) {
  return `'${album.name}' by ${artistsStr(album.artists)}`
}