function loadInitialTracks() {
  const tracks = JSON.parse(localStorage.getItem("tracks"))
  tracks && displayTracks("songs",tracks);
}

function filterTracks(tracks) {
  let _tracks = tracks.filter((el) => el.duration_ms < 263000 && el.duration_ms > 257000)
  return _tracks.sort((a,b) => (Math.abs(260000 - a.duration_ms) - Math.abs(260000 - b.duration_ms)));
}

function storeTracks(tracks) {
  localStorage.setItem("tracks",JSON.stringify(tracks))
}

async function runSearch() {
  const select = document.getElementById("search-select");
  let tracks = [];
  switch(select.selectedIndex) {
    case 0:
      tracks = await getSavedSongs();
      break;
    case 1:
      const albums = await getSavedAlbums();
      for (let i = 0; i < albums.length; i++) {
        let _tracks = albums[i].album.tracks.items;
        delete albums[i].album.tracks;
        _tracks.forEach((el) => el.album = albums[i].album);
        tracks.push(..._tracks);
      }
      break;
    default:
      console.error("Error: Invalid dropdown choice")
  }
  tracks = filterTracks(tracks)
  displayTracks("songs",tracks);
}