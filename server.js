const express = require('express');
const path = require('path');
const app = express();

// Serve everything in public folder statically
app.use(express.static(path.join(__dirname, 'public')));

// Optional fallback to index.html for any unknown route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
