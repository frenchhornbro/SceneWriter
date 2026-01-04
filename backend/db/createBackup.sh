#!/bin/bash

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_FILE="$SCRIPT_DIR/scenewriter.sqlite"

# Generate the base backup name with current date
DATE_SUFFIX=$(date +"%b-%-d-%Y" | tr '[:upper:]' '[:lower:]')
BASE_NAME="scenewriter-backup-${DATE_SUFFIX}"
BACKUP_FILE="$SCRIPT_DIR/${BASE_NAME}.sqlite"

# Check if source file exists
if [ ! -f "$SOURCE_FILE" ]; then
    echo "Error: Source file $SOURCE_FILE does not exist"
    exit 1
fi

# If the backup file already exists, add a counter suffix
if [ -f "$BACKUP_FILE" ]; then
    COUNTER=1
    while [ -f "$SCRIPT_DIR/${BASE_NAME}-(${COUNTER}).sqlite" ]; do
        ((COUNTER++))
    done
    BACKUP_FILE="$SCRIPT_DIR/${BASE_NAME}-(${COUNTER}).sqlite"
fi

# Perform the backup using SQLite's .backup command
# Convert Unix-style paths to Windows-style for SQLite on Windows
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$OSTYPE" == "win32" ]]; then
    WIN_SOURCE=$(cygpath -w "$SOURCE_FILE")
    WIN_BACKUP=$(cygpath -w "$BACKUP_FILE")
    sqlite3 "$WIN_SOURCE" ".backup '$WIN_BACKUP'"
else
    sqlite3 "$SOURCE_FILE" ".backup '$BACKUP_FILE'"
fi

if [ $? -eq 0 ]; then
    echo ".backup $(basename "$BACKUP_FILE")"
else
    echo "Error: Backup failed"
    exit 1
fi
