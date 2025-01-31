import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useParams } from "react-router-dom";
import { default as axios } from 'axios';

import "./index.css";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

const Home = () => {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`)
      .then((response) => setMovies(response.data.results))
      .catch((error) => console.error(error));
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center my-4">Trending Movies</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {movies.map((movie) => (
          <Link to={`/movie/${movie.id}`} key={movie.id} className="hover:opacity-80">
            <img src={`${IMAGE_BASE_URL}${movie.poster_path}`} alt={movie.title} className="rounded-lg" />
            <p className="text-center mt-2">{movie.title}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

const MovieDetails = () => {
  const { movieId } = useParams();
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`)
      .then((response) => setMovie(response.data))
      .catch((error) => console.error(error));
  }, [movieId]);

  if (!movie) return <p className="text-center">Loading...</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center">{movie.title}</h1>
      <img src={`${IMAGE_BASE_URL}${movie.poster_path}`} alt={movie.title} className="mx-auto rounded-lg" />
      <p className="text-lg text-center mt-4">{movie.overview}</p>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <nav className="bg-gray-900 text-white p-4 text-center">
        <Link to="/" className="text-2xl font-bold">MovieList</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movie/:movieId" element={<MovieDetails />} />
      </Routes>
    </Router>
  );
};

export default App;
