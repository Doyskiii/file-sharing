@echo off
echo Starting File Sharing Application Servers...
echo.

echo Starting Backend Server on Port 3333...
start cmd /k "cd /d c:\Users\LENOVO\file-sharing(backup)\backend && echo Backend Server Starting... && node ace serve --watch"

timeout /t 10 /nobreak >nul

echo.
echo Starting Frontend Server on Port 3001...
start cmd /k "cd /d c:\Users\LENOVO\file-sharing(backup)\frontend && echo Frontend Server Starting... && npx next dev --port 3001"

echo.
echo Servers should now be running:
echo - Backend: http://localhost:3333
echo - Frontend: http://localhost:3001
echo.
echo The frontend connects to the backend using NEXT_PUBLIC_BACKEND_URL=http://localhost:3333
echo.
pause