#!/bin/bash
# Kill process on specified port (default: 3000)
PORT=${1:-3000}

PID=$(lsof -ti:$PORT 2>/dev/null)

if [ -n "$PID" ]; then
  echo "Killing process $PID on port $PORT..."
  kill -9 $PID 2>/dev/null
  sleep 1
  echo "Port $PORT is now free"
else
  echo "Port $PORT is available"
fi
