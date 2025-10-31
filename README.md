# Workouts

Start the server locally:
1. Copy `.env.example` to `.env` and fill in USER_API_KEY and ADMIN_API_KEY (and PORT if desired).
2. Install dependencies:
   - npm install
3. Start:
   - npm start
4. Verify:
   - Visit http://localhost:<PORT>/ping



API base URL: http://localhost:PORT/api/workouts

Authentication:
- Provide API key in header: x-api-key: <your_key>
- Use USER_API_KEY for a normal user, ADMIN_API_KEY for admin actions.
- For quick local testing you can use the defaults included in the example .env:
  - USER_API_KEY = user-key-example
  - ADMIN_API_KEY = admin-key-example
- To override, copy `.env.example` to `.env` and set your own values for USER_API_KEY and ADMIN_API_KEY.

Endpoints:
- POST /api/workouts
- GET /api/workouts
- PUT /api/workouts/:id
- DELETE /api/workouts/:id

Notes:
- Data persisted in data/workouts.json.
- Start script: "start": "node server.js"

challenges faced:
- making pdf's of the screenshots within the time provided
- making the code work properly