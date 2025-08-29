#!/bin/bash

if command -v live-server >/dev/null 2>&1; then
    live-server .
else
    npm install live-server -g
    live-server .
fi
