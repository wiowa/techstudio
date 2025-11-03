#!/bin/bash

# Check if mymemory is affected by changes
echo "Checking if mymemory is affected..."

# Run nx affected to check if mymemory needs rebuilding
npx nx show projects --affected --base=HEAD~1 --head=HEAD | grep -q "mymemory"

if [ $? -eq 0 ]; then
    echo "✅ mymemory is affected - continuing deployment"
    exit 0
else
    echo "❌ mymemory is not affected - skipping deployment"
    exit 1
fi
