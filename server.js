const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// mount routes
app.use('/api/workouts', require('./routes/workouts'));

// health check
app.get('/ping', (req, res) => res.json({ ok: true, time: Date.now() }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
