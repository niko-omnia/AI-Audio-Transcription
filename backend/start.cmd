@echo off

title Backend

echo killing old instances...

taskkill /f /im node.exe > nul
cls

echo Starting Backend...

npx concurrently -n WHISPER_SERVER,BACKEND -c blue,green "cd whisper_server && uvicorn whisper_server:app --host 127.0.0.1 --port 5001" "npm run start" --kill-others

echo Backend is running!
