#!/bin/bash

# Check if myhost is affected by changes
echo "Checking if myhost is affected..."

# Run nx affected to check if myhost needs rebuilding
npx nx show projects --affected --base=HEAD~1 --head=HEAD | grep -q "myhost"

if [ $? -eq 0 ]; then
    echo "✅ myhost is affected - continuing deployment"
    exit 0
else
    echo "❌ myhost is not affected - skipping deployment"
    exit 1
fi
