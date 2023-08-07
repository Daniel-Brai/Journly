#!/bin/bash

# Start Nginx in the background
nginx -g "daemon off;" &

# Start your Node.js app (replace with your actual Node.js startup command)
node ../dist/main.js
