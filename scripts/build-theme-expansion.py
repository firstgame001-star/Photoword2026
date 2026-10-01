"""Build the four authored theme banks and their server answer seed."""
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
new_ids = ['animals', 'transport', 'home', 'nature']
data = {}
theme = None
for line in (root / 'scripts/theme-expansion-data.txt').read_text().splitlines():
    if line.startswith('['):
        theme = line[1:-1]
        data[theme] = []
        continue
    ru, en, az, emojis, hr, he, ha = line.split('|')
    answers = [ru, en, az]
    assert all(a and a == a.upper() and not any(c.isspace() for c in a) for a in answers), line
    row = {'id': len(data[theme]) + 1, 'photos': emojis.split()}
    assert len(row['photos']) == 4, line
    for lang, answer, hint in zip(['ru', 'en', 'az'], answers, [hr, he, ha]):
        row[lang] = {'answer': answer, 'hint': hint}
    data[theme].append(row)
assert list(data) == new_ids
assert all(len(rows) == 100 for rows in data.values())
(root / 'clean/theme-levels-expansion.js').write_text(
    'Object.assign(window.PW_THEME_EXTRA, ' + json.dumps(data, ensure_ascii=False, indent=2) + ');\n')

old = "'sport','art','professions','travel','science','technology','cinema','food'"
new = old + ',' + ','.join("'" + k + "'" for k in new_ids)
sql = (root / 'server/theme_cinema_food.sql').read_text().split('insert into public.theme_level_answers')[0].replace(old, new)
def quote(s):
    return "'" + s.replace("'", "''") + "'"
values = []
for theme, rows in data.items():
    for row in rows:
        values.append(' (' + ','.join([quote(theme), str(row['id'])] + [quote(row[l]['answer']) for l in ['ru', 'en', 'az']]) + ')')
sql += 'insert into public.theme_level_answers(theme_id,level_id,ru,en,az) values\n' + ',\n'.join(values)
sql += '\non conflict (theme_id,level_id) do update set ru=excluded.ru,en=excluded.en,az=excluded.az;\n\ncommit;\n'
(root / 'server/theme_expansion.sql').write_text(sql)
