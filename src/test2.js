import React, { useState, useEffect, createContext, useContext } from "react";
import { Moon, Sun, Search, TrendingUp, Film, Star, Calendar, Clock } from "lucide-react";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

// Create Theme Context
const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, setIsDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

const TabButton = ({ active, children, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg ${
      active 
        ? 'bg-blue-500 text-white' 
        : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
    } hover:opacity-90 transition-colors`}
  >
    {children}
  </button>
);

const SortButton = ({ label, icon: Icon, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm ${
      active 
        ? 'bg-blue-500 text-white' 
        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
    } hover:opacity-90`}
  >
    <Icon size={16} />
    {label}
  </button>
);

const MovieCard = ({ movie, onMovieClick }) => (
  <div 
    onClick={() => onMovieClick(movie.id)} 
    className="cursor-pointer group relative"
  >
    <img 
      src={`${IMAGE_BASE_URL}${movie.poster_path}`} 
      alt={movie.title} 
      className="rounded-lg w-full transition-transform duration-200 group-hover:scale-105"
    />
    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-opacity rounded-lg flex items-center justify-center">
      <div className="opacity-0 group-hover:opacity-100 text-white text-center p-4">
        <p className="font-bold mb-2">{movie.title}</p>
        <p className="text-sm">⭐ {movie.vote_average.toFixed(1)}</p>
        <p className="text-sm">{movie.release_date?.split('-')[0]}</p>
      </div>
    </div>
  </div>
);

const GenreFilter = ({ genres, selectedGenres, onGenreToggle }) => (
  <div className="flex flex-wrap gap-2 mb-4">
    {genres.map((genre) => (
      <button
        key={genre.id}
        onClick={() => onGenreToggle(genre.id)}
        className={`px-3 py-1 rounded-full text-sm ${
          selectedGenres.includes(genre.id)
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
        }`}
      >
        {genre.name}
      </button>
    ))}
  </div>
);

const PageTitle = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-2 text-2xl font-bold my-4 dark:text-white">
    <Icon size={24} />
    <h2>{title}</h2>
  </div>
);

const MovieGrid = ({ movies, onMovieClick }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
    {movies.map((movie) => (
      <MovieCard 
        key={movie.id} 
        movie={movie} 
        onMovieClick={onMovieClick}
      />
    ))}
  </div>
);

const MovieList = ({ onMovieClick }) => {
  const [view, setView] = useState('trending');
  const [timeWindow, setTimeWindow] = useState('day');
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [page, setPage] = useState(1);

  useEffect(() => {
    // Fetch genres
    fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}`)
      .then(res => res.json())
      .then(data => setGenres(data.genres))
      .catch(error => console.error(error));
  }, []);

  useEffect(() => {
    let url;
    if (view === 'trending') {
      url = `${BASE_URL}/trending/movie/${timeWindow}?api_key=${API_KEY}&page=${page}`;
    } else {
      url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&sort_by=${sortBy}&page=${page}${
        selectedGenres.length ? `&with_genres=${selectedGenres.join(',')}` : ''
      }`;
    }

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setMovies(page === 1 ? data.results : [...movies, ...data.results]);
      })
      .catch(error => console.error(error));
  }, [view, timeWindow, sortBy, selectedGenres, page]);

  const handleGenreToggle = (genreId) => {
    setSelectedGenres(prev => 
      prev.includes(genreId)
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId]
    );
    setPage(1);
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-wrap gap-2 mb-6">
        <TabButton 
          active={view === 'trending'} 
          onClick={() => { setView('trending'); setPage(1); }}
        >
          <div className="flex items-center gap-2">
            <TrendingUp size={20} />
            Trending
          </div>
        </TabButton>
        <TabButton 
          active={view === 'discover'} 
          onClick={() => { setView('discover'); setPage(1); }}
        >
          <div className="flex items-center gap-2">
            <Film size={20} />
            Discover
          </div>
        </TabButton>

        {view === 'trending' && (
          <div className="flex gap-2 ml-auto">
            <TabButton 
              active={timeWindow === 'day'} 
              onClick={() => { setTimeWindow('day'); setPage(1); }}
            >
              Today
            </TabButton>
            <TabButton 
              active={timeWindow === 'week'} 
              onClick={() => { setTimeWindow('week'); setPage(1); }}
            >
              This Week
            </TabButton>
          </div>
        )}
      </div>

      {view === 'discover' && (
        <>
          <GenreFilter 
            genres={genres}
            selectedGenres={selectedGenres}
            onGenreToggle={handleGenreToggle}
          />

          <div className="flex flex-wrap gap-2 mb-6">
            <SortButton
              label="Popularity"
              icon={Star}
              active={sortBy === 'popularity.desc'}
              onClick={() => { setSortBy('popularity.desc'); setPage(1); }}
            />
            <SortButton
              label="Release Date"
              icon={Calendar}
              active={sortBy === 'release_date.desc'}
              onClick={() => { setSortBy('release_date.desc'); setPage(1); }}
            />
            <SortButton
              label="Rating"
              icon={Star}
              active={sortBy === 'vote_average.desc'}
              onClick={() => { setSortBy('vote_average.desc'); setPage(1); }}
            />
          </div>
        </>
      )}

      <PageTitle 
        icon={view === 'trending' ? TrendingUp : Film}
        title={view === 'trending' ? 'Trending Movies' : 'Discover Movies'}
      />

      <MovieGrid movies={movies} onMovieClick={onMovieClick} />

      <div className="flex justify-center mt-8">
        <button
          onClick={loadMore}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Load More
        </button>
      </div>
    </div>
  );
};

// ... (MovieDetails component remains the same as before)

const App = () => {
  const { isDark, setIsDark } = useContext(ThemeContext);
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setIsSearching(true);
    fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}`)
      .then(res => res.json())
      .then(data => {
        setSearchResults(data.results);
      })
      .catch(error => console.error(error));
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      <nav className="bg-gray-900 dark:bg-gray-800 text-white p-4 sticky top-0 z-50">
        <div className="container mx-auto flex flex-wrap gap-4 items-center justify-between">
          <span 
            className="text-2xl font-bold cursor-pointer"
            onClick={() => {
              setSelectedMovieId(null);
              setIsSearching(false);
            }}
          >
            MovieList
          </span>
          
          <div className="flex-1 max-w-xl mx-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search movies..."
              className="w-full p-2 rounded-lg bg-gray-700 text-white placeholder-gray-400"
            />
          </div>

          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-lg hover:bg-gray-700"
          >
            {isDark ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </div>
      </nav>
      
      {selectedMovieId ? (
        <MovieDetails 
          movieId={selectedMovieId} 
          onBack={() => setSelectedMovieId(null)}
        />
      ) : isSearching ? (
        <div className="container mx-auto p-4">
          <h2 className="text-2xl font-bold my-4 dark:text-white">Search Results</h2>
          <MovieGrid movies={searchResults} onMovieClick={setSelectedMovieId} />
        </div>
      ) : (
        <MovieList onMovieClick={setSelectedMovieId} />
      )}
    </div>
  );
};

const AppWrapper = () => {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
};

export default AppWrapper;