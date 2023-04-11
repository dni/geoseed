import log from 'loglevel';
import { wordlists } from 'bip39';
import { Fraction } from 'fraction.js';

function chunkArray(arr, chunk_size) {
  let tmp = [];
  for (let i = 0; i < arr.length; i += chunk_size) {
    tmp.push(arr.slice(i, i+ chunk_size));
  }
  return tmp;
}


const count = 4;
const wordlist = wordlists.EN;
const split64seed = chunkArray(wordlist, 64)
const split45seed = chunkArray(wordlist.slice(0, 2025), 45)
// const split20seed = chunkArray(wordlist.slice(0, 400), 20)
const tiles = [
    { size: Fraction(45).div(8), seed: split64seed },
    { size: Fraction(1).div(8), seed: split45seed },
    { size: Fraction(1).div(360), seed: split45seed },
    { size: Fraction(1).div(16200), seed: split45seed },
    // { size: Fraction(1).div(324000), seed: split20seed },
];

export function to_words(lat, lng) {
  let longitude = Fraction(lng).sub(180).mod(360).add(360);
  let latitude = Fraction(lat).add(90);
  let words = new Array(count);
  for (let i = 0; i < count; i++) {
    let current_latitude = latitude.div(tiles[i].size).floor();
    let current_longitude = longitude.div(tiles[i].size).floor();
    latitude = latitude.sub(tiles[i].size.mul(current_latitude))
    longitude = longitude.sub(tiles[i].size.mul(current_longitude))
    words[i] = tiles[i].seed[current_latitude][current_longitude]
  }
  return words;
}


export function from_words(words) {
  let latitude = 0
  let longitude = 0
  for (let i = 0; i < words.length; i++) {
    let [wlat, wlng] = 0;
    for (var j = 0; j < tileseeds[i].length; j++) {
      let index = tileseeds[j].indexOf(words[i]);
      if (index > -1) {
        wlat = i;
        wlng = index;
        break;
      }
    }
    latitude = latitude.add(wlat * tilesizes[i]);
    longitude = longitude.add(wlng * tilesizes[i]);
  }
  return {
      lat: latitude.sub(180),
      lng: longitude.sub(90)
  }
}
