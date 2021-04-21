import axios from "axios";
import * as $ from "jquery";

const $showsList = $("#showsList");
const $episodesList = $("#episodesList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const BASE_URL = "http://api.tvmaze.com/";
const ALT_IMG = "https://tinyurl.com/tv-missing";

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

type Show = {
  id: number,
  name: string,
  summary: string,
  image: {medium: string}
}

type Episode = {
  id: number,
  name: string,
  season: string,
  number: string
}

async function getShowsByTerm(term: string): Promise<Show[]> {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
  let result = await axios.get(`${BASE_URL}search/shows?q=${term}`);

  const shows = result.data.map((data: { show: Show }) => ({
    id: data.show.id,
    name: data.show.name,
    summary: data.show.summary,
    image: data.show.image?.medium || ALT_IMG,
  }));

  return shows;
}

/** Given list of shows, create markup for each and to DOM */

function populateShows(shows: Show[]) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image}"
              alt="Bletchly Circle San Francisco"
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `
    );

    $showsList.append($show);
  }
}

/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val() as string;
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id: number) {
  let res = await axios.get(`${BASE_URL}shows/${id}/episodes`);   
  const episodes = res.data.map((episode : Episode) => ({
    id: episode.id,
    name: episode.name,
    season: episode.season,
    number: episode.number
  }));
   return episodes;
}

/** Write a clear docstring for this function... */

function populateEpisodes(episodes: Episode[]) { 
  $episodesList.empty()

  for (let episode of episodes) {
    const $item = $(
      `<li>
      ${episode.name}
      
      ${episode.season}
      ${episode.number}
      </li>`
    )
    $episodesList.append($item)
  }
  $episodesArea.show();
}

$showsList.on("click", "button", async function(evt: JQuery.ClickEvent){
  const id = $(evt.target).closest(".Show").data("show-id");

  const episodes = await getEpisodesOfShow(id);

  populateEpisodes(episodes);
});