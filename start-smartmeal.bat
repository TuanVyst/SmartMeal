@echo off
echo Starting SmartMeal Backend...
start "SmartMeal-BE" cmd /c "cd /d "%~dp0Server\PresentationLayer" && dotnet run --urls http://localhost:5267"
echo Waiting for backend to start...
timeout /t 8 /nobreak >nul
echo Starting SmartMeal Frontend...
start "SmartMeal-FE" cmd /c "cd /d "%~dp0Client" && npm run dev"
echo.
echo SmartMeal is running!
echo Backend:  http://localhost:5267
echo Frontend: http://localhost:5173
echo.
pause
