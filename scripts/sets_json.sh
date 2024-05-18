#!/bin/bash

wget -O SetList.json https://mtgjson.com/api/v5/SetList.json
python scripts/sets_json.py