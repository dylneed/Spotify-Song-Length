function loadInitialTracks() {
  displayArr("songs",JSON.parse(localStorage.getItem("tracks")),trackStr);
}

function displayArr(id,arr, func = (el) => el) {
  const parent = document.getElementById(id)
  parent.innerHTML = "";
  for (let i = 0; i < arr.length; i++) {
    const child = document.createElement("p");

    const icon = document.createElement("img");
    icon.setAttribute("src",arr[i].album.images[2].url);
    icon.style.height = "1.5rem";
    child.appendChild(icon);

    child.appendChild(document.createTextNode(func(arr[i])));

    if(arr[i].preview_url !== null) {
      audio = document.createElement("audio")
      audio.setAttribute("controls", true)
      audio.style.height = "1.5rem";
      audioSource = document.createElement("source");
      audioSource.setAttribute("src", arr[i].preview_url)
      audio.appendChild(audioSource)
      child.appendChild(audio)
    }

    parent.appendChild(child);
  }
  
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
  console.log(tracks)
  localStorage.setItem("tracks",JSON.stringify(tracks))
  displayArr("songs",tracks,trackStr);
}