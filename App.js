function loadInitialTracks() {
  const tracks = JSON.parse(localStorage.getItem("tracks"))
  tracks && displayTracks("songs",tracks);
}

function playAudio(src) {
  player = document.getElementById("audio-player");
  player.innerHTML = ""
  source = document.createElement("source");
  source.setAttribute("src", src);
  player.appendChild(source);
  player.load();
  player.focus();
}

function _4_20(track) {
  return track.duration_ms < 263000 && track.duration_ms > 257000
}

async function savedSongs() {
  const rawTracks = await getSavedSongs();
  return rawTracks.filter((tr) => _4_20(tr.track)).map((el) => el.track);
}

async function savedAlbums() {
  const albums = await getSavedAlbums();
  let tracks = []
  for (let i = 0; i < albums.length; i++) {
    let _tracks = albums[i].album.tracks.items;
    delete albums[i].album.tracks;
    _tracks.forEach((el) => el.album = albums[i].album);
    tracks.push(..._tracks.filter(_4_20));
  }
  return tracks;
}

async function runSearch() {
  const select = document.getElementById("search-select");
  let tracks;
  switch(select.selectedIndex) {
    case 0:
      tracks = await savedSongs();
      break;
    case 1:
      tracks = await savedAlbums();
      break;
    case 2:
      tracks = await fromAlbums();
    default:
      console.error("Error: Invalid dropdown choice")
  }
  tracks.sort((a,b) => (Math.abs(260000 - a.duration_ms) - Math.abs(260000 - b.duration_ms)));
  localStorage.setItem("tracks",JSON.stringify(tracks))
  displayTracks("songs",tracks);
}