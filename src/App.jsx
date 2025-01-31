import React, { useState, useEffect, createContext, useContext } from "react";
import { Moon, Sun, Search, TrendingUp, Film, Star, Calendar, Clock } from "lucide-react";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

// Theme Context
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

// Component for movie cards with better responsive design
const MovieCard = ({ movie, onMovieClick }) => {
  const imageUrl = movie.poster_path 
    ? `${IMAGE_BASE_URL}${movie.poster_path}`
    : '/api/placeholder/300/450';

  return (
    <div 
      onClick={() => onMovieClick(movie.id)} 
      className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800 cursor-pointer group"
    >
      <img 
        src={imageUrl}
        alt={movie.title}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        onError={(e) => {
          e.target.src = '/api/placeholder/300/450';
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="font-bold text-sm md:text-base line-clamp-2">
            {movie.title}
          </h3>
          <div className="flex items-center gap-2 text-xs md:text-sm mt-1">
            <span className="flex items-center">
              ⭐ {movie.vote_average?.toFixed(1) || 'N/A'}
            </span>
            <span>•</span>
            <span>{movie.release_date?.split('-')[0] || 'TBA'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ active, children, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-2 rounded-lg text-sm md:text-base ${
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

const GenreFilter = ({ genres, selectedGenres, onGenreToggle }) => (
  <div className="flex flex-wrap gap-2 mb-4">
    {genres.map((genre) => (
      <button
        key={genre.id}
        onClick={() => onGenreToggle(genre.id)}
        className={`px-3 py-1 rounded-full text-xs md:text-sm ${
          selectedGenres.includes(genre.id)
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
        } hover:opacity-90`}
      >
        {genre.name}
      </button>
    ))}
  </div>
);

const MovieGrid = ({ movies, onMovieClick }) => (
  <div 
    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5"
    style={{ 
      minHeight: '200px',
      // Prevent layout shift during filtering/loading
      gridTemplateRows: 'masonry'
    }}
  >
    {movies.map((movie) => (
      <MovieCard 
        key={movie.id} 
        movie={movie} 
        onMovieClick={onMovieClick}
      />
    ))}
  </div>
);
const MovieDetails = ({ movieId, onBack }) => {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        setLoading(true);
        const [movieResponse, creditsResponse] = await Promise.all([
          fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`),
          fetch(`${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}`)
        ]);
        
        const movieData = await movieResponse.json();
        const creditsData = await creditsResponse.json();
        
        setMovie({
          ...movieData,
          cast: creditsData.cast?.slice(0, 10) || [],
          crew: creditsData.crew?.filter(person => 
            person.job === "Director" || person.job === "Writer"
          ) || []
        });
      } catch (error) {
        console.error('Error fetching movie details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [movieId]);

  if (loading) {
    return (
      <div className="container mx-auto p-4 animate-pulse">
        <div className="h-8 w-32 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
        <div className="h-96 bg-gray-300 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  if (!movie) return null;

  const backdropUrl = movie.backdrop_path 
    ? `${IMAGE_BASE_URL}${movie.backdrop_path}`
    : null;

  const posterUrl = movie.poster_path
    ? `${IMAGE_BASE_URL}${movie.poster_path}`
    : '/api/placeholder/300/450';

  return (
    <div className="container mx-auto p-4">
      <button
        onClick={onBack}
        className="mb-4 flex items-center gap-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
      >
        ← Back to movies
      </button>

      <div className="relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
        {backdropUrl && (
          <div className="relative h-[300px] md:h-[400px]">
            <div className="absolute inset-0">
              <img
                src={backdropUrl}
                alt={`${movie.title} backdrop`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
            </div>
          </div>
        )}

        <div className="relative p-6 -mt-16">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-[200px] flex-shrink-0 mx-auto md:mx-0">
              <img
                src={posterUrl}
                alt={movie.title}
                className="w-full rounded-lg shadow-lg"
              />
            </div>

            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold mb-2 dark:text-white">
                {movie.title}
                {movie.release_date && (
                  <span className="text-gray-500 dark:text-gray-400 ml-2">
                    ({movie.release_date.split('-')[0]})
                  </span>
                )}
              </h1>

              <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
                {movie.runtime > 0 && (
                  <span className="flex items-center gap-1">
                    <Clock size={16} />
                    {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                  </span>
                )}
                {movie.vote_average > 0 && (
                  <span className="flex items-center gap-1">
                    <Star size={16} className="text-yellow-400" fill="currentColor" />
                    {movie.vote_average.toFixed(1)}
                  </span>
                )}
                {movie.genres?.map(genre => (
                  <span
                    key={genre.id}
                    className="px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>

              {movie.tagline && (
                <p className="text-lg italic text-gray-600 dark:text-gray-400 mb-4">
                  {movie.tagline}
                </p>
              )}

              {movie.overview && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold mb-2 dark:text-white">Overview</h2>
                  <p className="text-gray-700 dark:text-gray-300">{movie.overview}</p>
                </div>
              )}

              {movie.cast?.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold mb-2 dark:text-white">Cast</h2>
                  <div className="flex flex-wrap gap-2">
                    {movie.cast.map(person => (
                      <span
                        key={person.id}
                        className="px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      >
                        {person.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {movie.crew?.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold mb-2 dark:text-white">Crew</h2>
                  <div className="flex flex-wrap gap-4">
                    {movie.crew.map(person => (
                      <div key={`${person.id}-${person.job}`}>
                        <p className="font-medium dark:text-white">{person.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{person.job}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MovieList = ({ onMovieClick }) => {
  const [view, setView] = useState('trending');
  const [timeWindow, setTimeWindow] = useState('day');
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}`)
      .then(res => res.json())
      .then(data => setGenres(data.genres))
      .catch(error => console.error(error));
  }, []);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchMovies = async () => {
      try {
        let url;
        if (view === 'trending') {
          url = `${BASE_URL}/trending/movie/${timeWindow}?api_key=${API_KEY}&page=${page}`;
        } else {
          url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&sort_by=${sortBy}&page=${page}${
            selectedGenres.length ? `&with_genres=${selectedGenres.join(',')}` : ''
          }`;
        }

        const response = await fetch(url);
        const data = await response.json();
        
        if (isMounted) {
          if (page === 1) {
            setMovies(data.results);
          } else {
            setMovies(prev => [...prev, ...data.results]);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error(error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchMovies();

    return () => {
      isMounted = false;
    };
  }, [view, timeWindow, sortBy, selectedGenres, page]);

  const handleGenreToggle = (genreId) => {
    setSelectedGenres(prev => 
      prev.includes(genreId)
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId]
    );
    setPage(1);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <div className="flex gap-2">
          <TabButton 
            active={view === 'trending'} 
            onClick={() => { setView('trending'); setPage(1); }}
          >
            <div className="flex items-center gap-2">
              <TrendingUp size={18} />
              Trending
            </div>
          </TabButton>
          <TabButton 
            active={view === 'discover'} 
            onClick={() => { setView('discover'); setPage(1); }}
          >
            <div className="flex items-center gap-2">
              <Film size={18} />
              Discover
            </div>
          </TabButton>
        </div>

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
              icon={TrendingUp}
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

      <div className="flex items-center gap-2 text-2xl font-bold mb-6 dark:text-white">
        {view === 'trending' ? <TrendingUp size={24} /> : <Film size={24} />}
        <h2>{view === 'trending' ? 'Trending Movies' : 'Discover Movies'}</h2>
      </div>

      <MovieGrid movies={movies} onMovieClick={onMovieClick} />

      <div className="flex justify-center mt-8">
        <button
          onClick={() => setPage(prev => prev + 1)}
          disabled={loading}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Load More'}
        </button>
      </div>
    </div>
  );
};

const App = () => {
  const { isDark, setIsDark } = useContext(ThemeContext);
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      setIsSearching(true);
      setSearchLoading(true);
      fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}`)
        .then(res => res.json())
        .then(data => {
          setSearchResults(data.results);
          setSearchLoading(false);
        })
        .catch(error => {
          console.error(error);
          setSearchLoading(false);
        });
    } else {
      setIsSearching(false);
      setSearchResults([]);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      <nav className="bg-gray-900 dark:bg-gray-800 text-white p-4 sticky top-0 z-50">
        <div className="container mx-auto flex flex-wrap gap-4 items-center justify-between">
          <span 
            className="text-xl md:text-2xl font-bold cursor-pointer"
            onClick={() => {
              setSelectedMovieId(null);
              setIsSearching(false);
              setSearchQuery('');
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
              className="w-full p-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-lg hover:bg-gray-700"
            aria-label="Toggle theme"
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
          <h2 className="text-2xl font-bold mb-6 dark:text-white">
            Search Results {searchLoading && '(Loading...)'}
          </h2>
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