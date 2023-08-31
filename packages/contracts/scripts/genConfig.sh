#!/bin/sh

yarn hardhat node&

processId=$!

# Check if the process is running
if kill -0 $processId >/dev/null 2>&1; then
    echo "Process is running"
    yarn hardhat run scripts/deploy.ts
    kill $processId
else
    echo "Process is not running"
fi