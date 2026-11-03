# Run from any routine: polls the live relay and keeps a durable local record.
# Prints SUBMITTED_THIS_WEEK=yes/no. State kept in state.json (not pushed; private).
import json, urllib.request, time, os
TOK = "nee7bZMvB7QwvGPk5hoyyJLk"
P = os.path.join(os.path.dirname(__file__), "state.json")
st = json.load(open(P)) if os.path.exists(P) else {"last_submit_at": 0, "items": [], "decisions": {}}
for topic in (f"taltul-{TOK}-i", f"taltul-{TOK}-t"):
    raw = urllib.request.urlopen(f"https://ntfy.sh/{topic}/json?poll=1&since=all", timeout=20).read().decode()
    for l in raw.splitlines():
        try:
            m = json.loads(json.loads(l)["message"])
        except Exception:
            continue
        if m.get("type") == "submit" and m["sub"]["at"] > st["last_submit_at"]:
            st["last_submit_at"] = m["sub"]["at"]; st["items"] = m["sub"]["items"]
        if m.get("type") == "decision": st["decisions"][m["dec"]["key"]] = m["dec"]
        if m.get("type") == "snapshot": st["decisions"].update(m["all"])
json.dump(st, open(P, "w"), ensure_ascii=False, indent=1)
week = time.time() * 1000 - st["last_submit_at"] < 7 * 86400000
print("SUBMITTED_THIS_WEEK=" + ("yes" if week else "no"))
print(json.dumps(st["items"], ensure_ascii=False))
