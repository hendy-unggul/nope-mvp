// Test if Vercel serverless functions work
module.exports = (req, res) => {
  res.status(200).json({ 
    status: 'API Works!',
    time: new Date().toISOString() 
  });
};
