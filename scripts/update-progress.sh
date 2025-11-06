#!/bin/bash

# PROGRESS.md ve NEXT_STEPS.md güncelleme scripti
# Kullanım: ./scripts/update-progress.sh "Yapılan iş açıklaması"

DESCRIPTION=$1

if [ -z "$DESCRIPTION" ]; then
    echo "Kullanım: ./scripts/update-progress.sh 'Yapılan iş açıklaması'"
    exit 1
fi

DATE=$(date +"%Y-%m-%d")

# PROGRESS.md'ye ekle
echo "" >> docs/PROGRESS.md
echo "- ✅ $DESCRIPTION - $DATE" >> docs/PROGRESS.md

echo "✅ PROGRESS.md güncellendi: $DESCRIPTION"

