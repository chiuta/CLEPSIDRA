# Verificare independentă a unui .ics exportat de CLEPSIDRA, cu `icalendar` + `python-dateutil` (BSD).
# Folosire: python3 ics_check.py fisier.ics 2026-10-14 2027-10-14  -> JSON: {"days": {"YYYY-MM-DD": ["HH:MM-HH:MM|SUMMARY", ...]}, "events": n}
# Dacă `icalendar` lipsește (poate fi dat prin FFF_PYLIB=<director cu pachete>), iese cu codul 3 și testul sare peste această parte.
import sys, os, json
if os.environ.get('FFF_PYLIB'):
    sys.path.insert(0, os.environ['FFF_PYLIB'])
try:
    from icalendar import Calendar
    from dateutil.rrule import rrulestr
except ImportError:
    sys.exit(3)
from datetime import datetime, timedelta

path, d0, d1 = sys.argv[1], sys.argv[2], sys.argv[3]
lo = datetime.fromisoformat(d0)
hi = datetime.fromisoformat(d1) + timedelta(days=1)
cal = Calendar.from_ical(open(path, 'rb').read())
days, n = {}, 0

def as_list(v):
    if v is None:
        return []
    return v if isinstance(v, list) else [v]

for ev in cal.walk('VEVENT'):
    n += 1
    start = ev['DTSTART'].dt
    end = ev['DTEND'].dt
    dur = end - start
    summary = str(ev['SUMMARY'])
    occ = set()
    if 'RRULE' in ev:
        rule = rrulestr(ev['RRULE'].to_ical().decode(), dtstart=start.replace(tzinfo=None) if start.tzinfo is None else start)
        for x in rule.between(lo, hi, inc=True):
            occ.add(x)
    else:
        occ.add(start.replace(tzinfo=None) if start.tzinfo is None else start)
    for r in as_list(ev.get('RDATE')):
        for x in r.dts:
            occ.add(x.dt)
    ex = set()
    for e in as_list(ev.get('EXDATE')):
        for x in e.dts:
            ex.add(x.dt)
    for o in sorted(occ):
        if o in ex or not (lo <= o.replace(tzinfo=None) < hi):
            continue
        key = o.strftime('%Y-%m-%d')
        e = o + dur
        days.setdefault(key, []).append('%s-%s|%s' % (o.strftime('%H:%M'), e.strftime('%H:%M'), summary))
for k in days:
    days[k].sort()
print(json.dumps({'days': days, 'events': n}, ensure_ascii=False))
