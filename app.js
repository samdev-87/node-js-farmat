const express = require('express');
const pricesRouter = require('./routes/pricesRouter');

const app = express();

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(
    express.urlencoded({
      extended: true,
    })
  ); // Parse URL-encoded bodies

app.use("/api", pricesRouter); // Use the prices routes

// Error handling middleware
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    console.error(err.message, err.stack);
    res.status(statusCode).json({ message: err.message });
    return;
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
// Export the app for testing purposes
