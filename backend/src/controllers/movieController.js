exports.searchMovies = async (req, res) => {
  const { query } = req.query;
  // Placeholder stub
  res.status(200).json({
    message: 'Movie search endpoint ready for TMDB API integration',
    query,
    results: [
      { id: 550, title: 'Fight Club', release_date: '1999-10-15' },
      { id: 27205, title: 'Inception', release_date: '2010-07-15' }
    ]
  });
};