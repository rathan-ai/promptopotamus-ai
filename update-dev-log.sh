#!/bin/bash

# Quick script to update development log with current status
# Usage: ./update-dev-log.sh "Your update message"

if [ -z "$1" ]; then
    echo "Usage: ./update-dev-log.sh \"Your update message\""
    exit 1
fi

TIMESTAMP=$(date -u +"%Y-%m-%d %H:%M")
COMMIT=$(git rev-parse --short HEAD)

# Update the last line of DEVELOPMENT_LOG.md
sed -i '' "$ s/.*/*Last Updated: $TIMESTAMP UTC*/" DEVELOPMENT_LOG.md
sed -i '' "$ a\\
*Current Commit: $COMMIT*\\
*Development Phase: 2 (Frontend Implementation)*" DEVELOPMENT_LOG.md

# Add the new update entry
cat << EOF >> DEVELOPMENT_LOG.md

---

### $TIMESTAMP - $1
**Commit**: \`$COMMIT\`
**Status**: 🔄 In Progress

EOF

echo "Development log updated with: $1"
echo "Don't forget to commit the changes!"