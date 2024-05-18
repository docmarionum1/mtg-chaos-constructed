import json

cols = [
    'code', 'name', 'block', 'type', 'releaseDate',
    'isOnlineOnly', 'baseSetSize', 'isForeignOnly'
]

with open('SetList.json') as f:
    j = json.load(f)

output = []

for s in j['data']:
    output.append({
        col: s[col] if col in s else None for col in cols
    })

with open('src/sets.json', 'w') as f:
    json.dump(output, f)