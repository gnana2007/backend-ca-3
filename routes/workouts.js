const express = require('express');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');
const { authRequired } = require('../middlewares/auth');

const router = express.Router();
const DATA_PATH = path.join(__dirname, '..', 'data', 'workouts.json');

async function readWorkouts() {
  try {
    const txt = await fs.readFile(DATA_PATH, 'utf8');
    return JSON.parse(txt);
  } catch (err) {
    return [];
  }
}

async function writeReviews(arr) {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(arr, null, 2), 'utf8');
}


router.post('/', authRequired, async (req, res) => {
  const { date, duration, exercise, caloriesburned, notes = 0, tags = [], status } = req.body;
  if (!exercise || !duration || !caloriesburned) {
    return res.status(400).json({ error: 'exercise, duration and caloriesburned are required' });
  }
  const r = Number(duration);
  if (!Number.isInteger(r) || r < 1 || r > 5) {
    return res.status(400).json({ error: 'duration must be an integer between 1 and 5' });
  }

  const workouts = await readWorkouts();

  const duplicate = workouts.find(
    (w) =>
      w.exercise.toLowerCase() === String(exercise).toLowerCase() &&
      w.userId === req.user.id
  );
  if (duplicate) {
    return res.status(409).json({ error: 'Duplicate workout: user has already logged this workout' });
  }

  const newWorkout = {
    id: uuidv4(),
    exercise,
    duration: r,
    caloriesburned,
    notes,
    tags: Array.isArray(tags) ? tags : [],
    status: status || 'pending',
    userId: req.user.id,
    date: new Date().toISOString()
  };

  workouts.push(newWorkout);
  await writeWorkouts(workouts );

  return res.status(201).json(newWorkout);
});


router.get('/', async (req, res) => {
  const { exercise, date, sort } = req.query;
  let workouts = await readWorkouts();

  if (exercise) {
    const q = String(exercise).toLowerCase();
    workouts = workouts.filter((w) => w.exercise && w.exercise.toLowerCase().includes(q));
  }
  if (date) {
    const d = new Date(date);
    workouts = workouts.filter((w) => new Date(w.date).toDateString() === d.toDateString());
  }
  if (status) {
    workouts = workouts.filter((w) => String(w.status).toLowerCase() === String(status).toLowerCase());
  }

  if (sort) {
    if (sort === 'caloriesBurned_asc') workouts.sort((a, b) => a.caloriesburned - b.caloriesburned);
    if (sort === 'caloriesBurned_desc') workouts.sort((a, b) => b.caloriesburned - a.caloriesburned);
    if (sort === 'date_asc') workouts.sort((a, b) => new Date(a.date) - new Date(b.date));
    if (sort === 'date_desc') workouts.sort((a, b) => new Date(b.date) - new Date(a.date));
  }
  return res.json(workouts);
});

router.put('/:id', authRequired, async (req, res) => {
  const { id } = req.params;
  const { duration, caloriesburned, notes } = req.body;

  const workouts = await readWorkouts();
  const idx = workouts.findIndex((w) => w.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Workout not found' });

  const workout = workouts[idx];
  if (workout.userId !== req.user.id) {
    return res.status(403).json({ error: 'Unauthorized: only the owner can update the workout' });
  }

  if (duration !== undefined) {
    const rv = Number(duration );
    if (!Number.isInteger(rv) || rv < 1 || rv > 5) {
      return res.status(400).json({ error: 'duration must be an integer between 1 and 5' });
    }
    workout.duration = rv;
  }
  if (caloriesburned !== undefined) workout.caloriesburned = caloriesburned;
  if (notes !== undefined) workout.notes = notes;

  workout.updatedAt = new Date().toISOString();

  workouts[idx] = workout;
  await writeWorkouts(workouts);

  return res.json(workout);
});

router.delete('/:id', authRequired, async (req, res) => {
  const { id } = req.params;
  const workouts = await readWorkouts();
  const idx = workouts.findIndex((w) => w.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Workout not found' });

  const workout = workouts[idx];
  if (workout.userId !== req.user.id && !req.user.isAdmin) {
    return res.status(403).json({ error: 'Unauthorized: only owner or admin can delete' });
  }

  workouts.splice(idx, 1);
  await writeWorkouts(workouts);

  return res.json({ ok: true, message: 'Workout deleted' });
});

module.exports = router;
