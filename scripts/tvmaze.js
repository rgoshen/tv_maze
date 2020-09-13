/** Given a query string, return array of matching shows:
 *     { id, name, summary, episodesUrl }
 */

/** Search Shows
 *    - given a search term, search for tv shows that
 *      match that query.  The function is async show it
 *       will be returning a promise.
 *
 *   - Returns an array of objects. Each object should include
 *     following show information:
 *    {
        id: <show id>,
        name: <show name>,
        summary: <show summary>,
        image: <an image from the show data, or a default image if no image exists, (image isn't needed until later)>
      }
 */
async function searchShows(query) {
  const apiUrl = "http://api.tvmaze.com/search/shows";

  const res = await axios.get(apiUrl, { params: { q: query } });
  let shows = res.data.map((result) => {
    let show = result.show;
    return {
      id: show.id,
      name: show.name,
      summary: show.summary,
      poster: show.image ? show.image.medium : "../imgs/missing.png",
    };
  });

  return shows;
}

/** Given a show ID, return list of episodes:
 *      { id, name, season, number }
 */

async function getEpisodes(id) {
  const apiUrl = `http://api.tvmaze.com/shows/${id}/episodes`;
  const res = await axios.get(apiUrl);
  let episodes = res.data.map((episode) => ({
    id: episode.id,
    name: episode.name,
    season: episode.season,
    number: episode.number,
  }));

  return episodes;
}

/** Populate shows list:
 *     - given list of shows, add shows to DOM
 */

function populateShows(shows) {
  const $showsList = $("#shows-list");

  $showsList.empty();

  for (let show of shows) {
    let $item = $(
      `<div class="col-md-6 col-lg-3 mb-2" data-show-id="${show.id}">
         <div class="card" data-show-id="${show.id}">
         <img src="${show.poster}" class="card-img-top image-fluid" alt="${show.name}">
           <div class="card-body">
             <h5 class="card-title">${show.name}</h5>
             <p class="card-text">${show.summary}</p>             
           </div>
           <div class="card-footer">
            <button type="button" id="episodes" class="btn btn-primary btn-block" data-toggle="modal">Episodes</button>
           </div>
         </div>
       </div>
      `
    );

    $showsList.append($item);
  }
}

/** Populate episodes list:
 *     - given list of episodes, add episodes to DOM
 */

function populateEpisodes(episodes, showTitle) {
  const $episodesList = $("#episodes-list");

  $episodesList.empty();

  for (let episode of episodes) {
    let $item = $(
      `
        <li>
          ${episode.name}
          (season ${episode.season}, episode ${episode.number})
        </li>
      `
    );
    $episodesList.append($item);
  }
  $episodesList.prepend(`<h2>${showTitle}</h2>`);
  $("#episodes-area").show();
}

/** Handle search form submission:
 *    - hide episodes area
 *    - get list of matching shows and show in shows list
 */

$("#search-form").on("submit", async function handleSearch(evt) {
  evt.preventDefault();

  let query = $("#search-query").val();
  if (!query) return;

  // $("#episodes-area").hide();

  let shows = await searchShows(query);

  populateShows(shows);
});

/** Handle episode click:
 *    - shows episodes area
 *    - gets list of episodes of the show matching it's id
 */

$("#shows-list").on("click", "#episodes", async function handleEpisodeClick(
  evt
) {
  let $showId = $(evt.target).offsetParent().data("showId");
  let $showTitle = $(evt.target).offsetParent().find("h5").html();

  let episodes = await getEpisodes($showId);

  populateEpisodes(episodes, $showTitle);
});
