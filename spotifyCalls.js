const base_address = "https://api.spotify.com/v1/";
const clientId = "9ab9b607a6cf443c96e60b1af838845d";
const authorizationEndpoint = "https://accounts.spotify.com/authorize";
const tokenEndpoint = "https://accounts.spotify.com/api/token";
const scope = 'user-read-private user-read-email user-library-read';

// On page load, try to fetch auth code from current browser search URL
const args = new URLSearchParams(window.location.search);
const code = args.get('code');

// If we find a code, we're in a callback, do a token exchange
if (code) {
  // Remove code from URL so we can refresh correctly.
  const url = new URL(window.location.href);
  url.searchParams.delete("code");

  const updatedUrl = url.search ? url.href : url.href.replace('?', '');
  window.history.replaceState({}, document.title, updatedUrl);

  getToken(code);
}

async function redirectToSpotifyAuthorize() {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const randomValues = crypto.getRandomValues(new Uint8Array(64));
  const randomString = randomValues.reduce((acc, x) => acc + possible[x % possible.length], "");

  const code_verifier = randomString;
  const data = new TextEncoder().encode(code_verifier);
  const hashed = await crypto.subtle.digest('SHA-256', data);

  const code_challenge_base64 = btoa(String.fromCharCode(...new Uint8Array(hashed)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  window.localStorage.setItem('code_verifier', code_verifier);

  const authUrl = new URL(authorizationEndpoint)
  const params = {
    response_type: 'code',
    client_id: clientId,
    scope: scope,
    code_challenge_method: 'S256',
    code_challenge: code_challenge_base64,
    redirect_uri: window.location.href,
  };

  authUrl.search = new URLSearchParams(params).toString();
  window.location.href = authUrl.toString(); // Redirect the user to the authorization server for login
}

// Spotify API Calls
async function getToken(code) {
  // stored in the previous step
  let codeVerifier = localStorage.getItem('code_verifier');

  const payload = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: 'authorization_code',
      code,
      redirect_uri: window.location.href,
      code_verifier: codeVerifier,
    }),
  }

  const body = await fetch(tokenEndpoint, payload);
  const response =await body.json();

  localStorage.setItem('access_token', response.access_token);
}

// Click handlers
async function loginWithSpotifyClick() {
  await redirectToSpotifyAuthorize();
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

  return _arr.map((el) => el.track);
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