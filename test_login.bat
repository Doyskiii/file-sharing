@echo off
echo Testing login with default Superadmin credentials...

curl -X POST http://localhost:3333/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"Superadmin@example.com\",\"password\":\"Superadmin123\"}" ^
  --verbose

echo.
echo Testing login with default Admin credentials...

curl -X POST http://localhost:3333/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"Admin@example.com\",\"password\":\"Admin123\"}" ^
  --verbose