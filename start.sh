#!/usr/bin/env bash
PORT=8092
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "🚀 啟動 ILab Resonance Filter Studio (http://localhost:$PORT)..."
cd "$DIR"
open "http://localhost:$PORT"
python3 -m http.server $PORT
