const base_address = "https://api.spotify.com/v1/";

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

async function visualSleep(sec) {
  createProgressBar("visual-sleep")
  for (let i = 0; i < sec * 10; i++) {
    await sleep(100)
    updateProgressBar(i/(sec * 10),"visual-sleep");
  }
  removeProgressBar("visual-sleep")
  return;
}

async function makeAPICall(endpoint, offset=0, limit=50) {
  const payload = {
    method: 'GET',
    headers: {"Authorization": `Bearer ${localStorage.getItem("access_token")}`}
  }
  const body = await fetch(`${base_address}${endpoint}?limit=${limit}&offset=${offset}`, payload)
  const text = await body.text()
  if (text === "Too many requests") {
    return {error: {status: 429, message:"Too many requests"}}
  }
  const response = JSON.parse(text);
  return await response;
}

async function getAPIData(endpoint) {
  const payload = {
    method: 'GET',
    headers: {"Authorization": `Bearer ${localStorage.getItem("access_token")}`}
  }
  const body = await fetch(base_address + endpoint, payload);
  const response = await body.json()
  return await response;
}

async function getData(endpoint, progressBarId=false, offset=0, limit=50) {
  const response = await makeAPICall(endpoint,offset,limit);
  if (response.error != undefined) {
    progressBarId && removeProgressBar(progressBarId);
    console.log(`Error ${response.error.status}: ${response.error.message}`); 
    if (response.error.status === 401) alert("You've been logged out. Please sign back in to Spotify");
    return;
  }

  progressBarId && updateProgressBar((offset + limit)/response.total, progressBarId)

  if (limit + offset > response.total) return response.items; // base case
  return response.items.concat(await getData(endpoint, progressBarId, offset + limit, limit)) // recursive case
}


async function getSavedSongs(limit=50, progressBar=true) {  
  let progressId;

  if (progressBar) {
    progressId = "savedSongs"
    createProgressBar(progressId);
  }

  const _arr = await getData("me/tracks",progressId,0,limit)

  if (progressBar) removeProgressBar(progressId)

  return _arr;
}

async function getSavedAlbums(limit=50,progressBar=true) {
  let progressId;

  if (progressBar) {
    progressId = "savedAlbums"
    createProgressBar(progressId);
  }

  const _arr = await getData("me/albums", progressId,0,limit)

  if (progressBar) removeProgressBar(progressId);

  return _arr;
}