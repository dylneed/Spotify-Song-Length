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

function trackElement(track) {
  const p = document.createElement("p");

  const cover = document.createElement("img");
  cover.setAttribute("src",track.album.images[2].url);
  cover.style.height = "1.5rem";
  p.appendChild(cover);

  // p.appendChild(document.createTextNode(trackStr(track)));
  p.innerHTML += trackStr(track);

  if(track.preview_url !== null) {
    const playButton = document.createElement("button");
    playButton.innerHTML = "Play"
    playButton.style.fontSize = "0.8333rem";
    playButton.setAttribute("onclick", `playAudio('${track.preview_url}');`)
    p.appendChild(playButton)
  }

  return p;
}

function displayTracks(id,track) {
  const parent = document.getElementById(id)
  parent.innerHTML = "";
  for (let i = 0; i < track.length; i++) {
    const child = trackElement(track[i]);
    parent.appendChild(child);
  }
  
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