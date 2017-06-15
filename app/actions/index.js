const mb = require('../rest/Musicbrainz');

export const CREATE_PLUGINS = 'CREATE_PLUGINS';
export const UNIFIED_SEARCH = 'UNIFIED_SEARCH';
export const UNIFIED_SEARCH_START = 'UNIFIED_SEARCH_START';
export const SEARCH_ERROR = 'SEARCH_ERROR';
export const SOURCES_SEARCH = 'SOURCES_SEARCH';

export function createSearchPlugins(pluginClasses) {
  var plugins = {};

  for ( var i=0; i<Object.keys(pluginClasses).length; i++ ) {
    var category = Object.keys(pluginClasses)[i];

    if (plugins[category] == undefined) {
          plugins[category] = [];
    }

    for (var j=0; j<Object.keys(pluginClasses[category]).length; j++) {
      var pluginName = Object.keys(pluginClasses[category])[j];
      var plugin = new pluginClasses[category][pluginName]();
      plugins[category].push(plugin);
    }
  }

  return {
    type: CREATE_PLUGINS,
    plugins: plugins
  };
}

export function sourcesSearch(terms, plugins) {
  var searchResults = {};
  for(var i=0; i<plugins.musicSources.length; i++) {
    Object.assign(searchResults, plugins.musicSources[i].search(terms));
  }

  return {
    type: SOURCES_SEARCH
  }
}

export function unifiedSearchStart() {
  return {
    type: UNIFIED_SEARCH_START,
    payload: null
  }
}

export function unifiedSearch(terms) {
  var search = [
    mb.artistSearch(terms),
    mb.releaseSearch(terms),
    mb.trackSearch(terms)
  ];

  return (dispatch) => {
    Promise.all(search)
    .then(values => {

      mb.addCoversToReleases(values[1])
      .then(response => {
        dispatch({
          type: UNIFIED_SEARCH,
          payload: values
        });
      })
      .catch(console.log);


    })
    .catch(error => {
      dispatch({
        type: SEARCH_ERROR,
        payload: error
      });
    });
  }
}
