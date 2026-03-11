/* @refresh reload */
import log from 'loglevel';
import { createEffect, For, Show } from "solid-js";
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
    <main id="app">
      <section class="hero">
        <p class="eyebrow">Geo-derived recovery phrases</p>
        <h1>
          Geoseed via <a target="_blank" rel="noreferrer" href="https://github.com/arcbtc/where39">where39</a>
        </h1>
        <p class="lede">
          Search Wikipedia for places with latitude and longitude, then derive a 12-word BIP39 seed phrase from those coordinates.
        </p>
      </section>

      <section class="layout">
        <div class="panel">
          <div class="panel-header">
            <div>
              <p class="panel-kicker">Configuration</p>
              <h2>Settings</h2>
            </div>
          </div>

          <div class="control-group">
            <span class="control-label">Locations</span>
            <div id="locations" class="pill-group">
              <label class="pill" htmlFor="location3">
                <input
                  id="location3"
                  name="locations[]"
                  type="radio"
                  value="3"
                  checked={locations() === 3}
                  onClick={() => setLocations(3)}
                />
                <span>3 places</span>
              </label>
              <label class="pill" htmlFor="location4">
                <input
                  id="location4"
                  name="locations[]"
                  type="radio"
                  value="4"
                  checked={locations() === 4}
                  onClick={() => setLocations(4)}
                />
                <span>4 places</span>
              </label>
            </div>
          </div>

          <div class="control-group">
            <label class="control-label" htmlFor="salt">Salt</label>
            <input
              id="salt"
              name="salt"
              type="number"
              min="100"
              max="999999"
              value={salt() * 1000000}
              placeholder="6666"
              onKeyUp={(e) => setSalt(parseInt(e.currentTarget.value) / 1000000)}
            />
          </div>
        </div>

        <div class="panel">
          <div class="panel-header">
            <div>
              <p class="panel-kicker">Inputs</p>
              <h2>Locations</h2>
            </div>
          </div>

          <ol class="location-list">
            <For each={data()}>
              {(item, index) => (
                <li class="location-item" data-index={index()}>
                  <div class="location-row">
                    <input
                      class="search-input"
                      name="search"
                      type="text"
                      value={item.name}
                      onKeyUp={(e) => set_search(index(), e.currentTarget.value)}
                    />
                    <button class="action-button" onclick={() => fetch_coords(index())}>Fetch coords</button>
                  </div>
                  <Show when={item.lat != 0 && item.lon != 0}>
                    <p class="coords">lat: {item.lat}, lon: {item.lon}</p>
                  </Show>
                </li>
              )}
            </For>
          </ol>
        </div>
      </section>

      <section class="panel panel-wide seeds-card">
        <div class="panel-header">
          <div>
            <p class="panel-kicker">Output</p>
            <h2>Seed words</h2>
          </div>
        </div>

        <div id="words" class="seed-grid">
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
      </section>

      <footer>
        <span>Built by <a target="_blank" rel="noreferrer" href="https://twitter.com/dnilabs">dni</a></span>
        <span class="footer-sep">/</span>
        <a id="github" target="_blank" rel="noreferrer" href="https://github.com/dni/geoseed/">View on GitHub</a>
      </footer>
    </main>
  ),
  document.getElementById("root")
);
