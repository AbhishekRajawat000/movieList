import React, { useState, useEffect, createContext, useContext } from "react";
import PropTypes from 'prop-types';
import { Moon, Sun, Search, TrendingUp } from "lucide-react";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original";

// Theme Context
const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true); // Default to dark theme
  
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, setIsDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

const MovieCard = ({ movie, onMovieClick }) => (
  <div 
    onClick={() => onMovieClick(movie.id)} 
    className="relative group cursor-pointer rounded-xl overflow-hidden transition-transform duration-300 hover:scale-105"
  >
    <div className="aspect-[2/3] relative">
      {movie.poster_path ? (
        <img 
          src={`${IMAGE_BASE_URL}${movie.poster_path}`} 
          alt={movie.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
          <span className="text-gray-400">No Image</span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
    <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
      <h3 className="font-semibold text-lg truncate">{movie.title}</h3>
      <div className="flex items-center gap-2 text-sm mt-1">
        <span className="flex items-center">
          <span className="text-yellow-400 mr-1">★</span>
          {movie.vote_average.toFixed(1)}
        </span>
        <span className="text-gray-300">
          {movie.release_date?.split('-')[0] || 'TBA'}
        </span>
      </div>
    </div>
  </div>
);

MovieCard.propTypes = {
  movie: PropTypes.shape({
    id: PropTypes.number.isRequired,
    poster_path: PropTypes.string,
    title: PropTypes.string.isRequired,
    vote_average: PropTypes.number.isRequired,
    release_date: PropTypes.string,
  }).isRequired,
  onMovieClick: PropTypes.func.isRequired,
};

const MovieGrid = ({ title, movies, onMovieClick }) => (
  <div className="mb-8">
    <div className="flex items-center gap-2 mb-4">
      <TrendingUp className="text-blue-500" size={24} />
      <h2 className="text-2xl font-bold text-white">{title}</h2>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {movies.map((movie) => (
        <MovieCard 
          key={movie.id} 
          movie={movie} 
          onMovieClick={onMovieClick}
        />
      ))}
    </div>
  </div>
);

MovieGrid.propTypes = {
  title: PropTypes.string.isRequired,
  movies: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      poster_path: PropTypes.string,
      title: PropTypes.string.isRequired,
      vote_average: PropTypes.number.isRequired,
      release_date: PropTypes.string,
    })
  ).isRequired,
  onMovieClick: PropTypes.func.isRequired,
};

const App = () => {
  const { isDark, setIsDark } = useContext(ThemeContext);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMovieId, setSelectedMovieId] = useState(null);

  useEffect(() => {
    fetch(`${BASE_URL}/trending/movie/day?api_key=${API_KEY}`)
      .then(res => res.json())
      .then(data => setTrendingMovies(data.results))
      .catch(error => console.error(error));
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim()) {
      fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}`)
        .then(res => res.json())
        .then(data => setSearchResults(data.results))
        .catch(error => console.error(error));
    } else {
      setSearchResults([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-900/50 backdrop-blur-md sticky top-0 z-50 border-b border-gray-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-white">MovieList</h1>
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearch}
                  placeholder="Search movies..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-full hover:bg-gray-800"
            >
              {isDark ? (
                <Sun className="text-gray-400 hover:text-white" size={24} />
              ) : (
                <Moon className="text-gray-400 hover:text-white" size={24} />
              )}
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {searchQuery ? (
          <MovieGrid 
            title="Search Results" 
            movies={searchResults} 
            onMovieClick={setSelectedMovieId}
          />
        ) : (
          <MovieGrid 
            title="Trending Movies" 
            movies={trendingMovies} 
            onMovieClick={setSelectedMovieId}
          />
        )}
      </main>
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