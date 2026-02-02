# TODO: Add Real-time Recent Activity to Dashboard

## Tasks
- [x] Add state for recentActivities in dashboard page
- [x] Add fetchRecentActivities function to get latest 5 activities
- [x] Call fetchRecentActivities in useEffect
- [x] Update Recent Activity card to display activities with formatted descriptions and timestamps
- [x] Add utility function for relative time display
- [x] Handle loading and error states for activities
- [x] Add real-time updates using polling (every 30 seconds)
- [x] Clean up interval on component unmount

# TODO: Display User List in Admin Menu/Dashboard

## Tasks
- [x] Add conditional rendering for admin users in dashboard
- [x] Add "Total Users" stat card for admin users linking to /admin/users
- [x] Add "Manage Users" quick action for admin users
- [x] Fetch total users count for admin stats
- [x] Ensure /admin/users page is accessible

# TODO: Switch Database from SQLite to PostgreSQL (db_magang)

## Tasks
- [x] Change default DB_CONNECTION in backend/config/database.ts from 'sqlite' to 'pg'
- [x] Fix check_sqlite.js to properly check PostgreSQL connection (rename to check_pg.js)
- [x] Run database migrations for PostgreSQL
- [x] Test database connection (migrations ran successfully, indicating connection works)
