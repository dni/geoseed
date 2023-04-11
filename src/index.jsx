/* @refresh reload */
import log from 'loglevel';
import { createEffect } from "solid-js";
import { render } from "solid-js/web";

log.setLevel("debug");

import { to_words } from "./where39";
import { words, setWords, data, setData, salt, setSalt, locations, setLocations } from "./signals";


const api_url = "https://en.wikipedia.org/api/rest_v1/page/summary/";

export const errorHandler = (error) => {
    if (typeof error.json === "function") {
        error.json().then(jsonError => {
            log.error(jsonError.error);
        }).catch(genericError => {
            log.error(genericError);
        });
    } else {
        log.error(error.message);
    }
};

export const checkResponse = (response) => {
  if (!response.ok) {
      return Promise.reject(response);
  }
  return response.json();
};

export const fetcher = (url, cb, params = null) => {
  fetch(api_url + url)
    .then(checkResponse)
    .then(cb)
    .catch(errorHandler);
};

export const fetch_coords = (index) => {
    let update_data = data();
    if (!update_data[index]) {
        log.warn("data index is undefined");
        return;
    }
    let search = update_data[index].name;
    if (!search) {
        log.warn("search term is undefined");
        return;
    }
    if (search.length < 3) {
        log.warn("search term too short");
        return;
    }
    fetcher(search, (result) => {
        update_data[index].lat = result.coordinates.lat;
        update_data[index].lon = result.coordinates.lon;
        log.debug("coords fetched and updated index: ", index, update_data);
        setData([]);
        setData(update_data);
    });
};


createEffect((update_data) => {
    let new_words = [];
    data().forEach((item) => {
        new_words.push(to_words(parseFloat(item.lat) + parseInt(salt()), parseFloat(item.lon) + parseInt(salt())));
    });
    setWords([]);
    setWords(new_words);
    log.debug("updated wordlist: ", new_words);
});

const set_search = (index, search) => {
    let new_data = data();
    if (!new_data[index]) return;
    new_data[index].name = search;
    setData(new_data);
};


render(
  () => (
    <div id="app">
      <h1>Geoseed Generator</h1>
      <p>Search Wikipedia for a Object with geolocation</p>
      <h2>Settings</h2>
      <div id="locations">
          <label for="locations">Locations: </label>
          <label htmlFor="location3">
            <input id="location3" name="locations[]" type="radio" value="3" checked="checked" onClick={() => setLocations(3)} />
            3
          </label>
          <label htmlFor="location4">
            <input id="location4" name="locations[]" type="radio" value="4" onClick={() => setLocations(4)} />
            4
          </label>
      </div>
      <label for="salt">Salt: </label>
      <input name="salt" type="number" min="100" max="999999" value={salt() * 1000000} placeholder="6666" onKeyUp={(e) => setSalt(parseInt(e.currentTarget.value) / 1000000)}/>
      <h2>Locations</h2>
      <ol>
          <For each={data()}>
              {(item, index) => (
                  <li data-index={index()}>
                      <input name="search" type="text" value={item.name} onKeyUp={(e) => set_search(index(), e.currentTarget.value)}/>
                      <button onclick={() => fetch_coords(index())}>Fetch coords</button>
                      <Show when={item.lat != 0 && item.lon != 0}>
                          &nbsp;|&nbsp;<span class="coords">lat: {item.lat}, lon: {item.lon}</span>
                      </Show>
                  </li>
              )}
          </For>
      </ol>
      <h2>Seed words</h2>
      <div id="words">
          <For each={words()}>
              {(subwords) => (
                  <div class="row">
                      <For each={subwords}>
                          {(item) => <div class="word">{item}</div>}
                      </For>
                  </div>
              )}
          </For>
      </div>
    </div>
  ),
  document.getElementById("root")
);
