import { createSignal } from "solid-js";

export const [data, setData] = createSignal([
    {name:"Lake_Chad",lat:13,lon:14.5},
    {name:"Eiffel_Tower",lat:0,lon:0},
    {name:"Schönbrunn_Palace",lat:0,lon:0},
]);

export const [salt, setSalt] = createSignal(0.00042);
export const [locations, setLocations] = createSignal(3);
export const [words, setWords] = createSignal([]);
