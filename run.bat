@echo off
REM
echo [RUNNING] Starting Backend...
cd backend
IF EXIST package.json (
    echo [RUNNING] Installing backend dependencies...
    call npm install
)
echo [RUNNING] Running Backend in development mode...
start cmd /k "npm run dev"
cd ..

REM
echo [RUNNING] Starting Frontend...
cd frontend
IF EXIST package.json (
    echo [RUNNING] Installing frontend dependencies...
    call npm install
)
echo [RUNNING] Running Frontend in development mode...
start cmd /k "npm run dev"
cd ..

REM
echo [RUNNING] Both backend and frontend are running in separate terminals.