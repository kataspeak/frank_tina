#!/usr/bin/env python3
"""skits_*_dialogs_jp.md から英語台本を抽出し、音声化用 JSON に変換する。

出力 JSON（1レベル = 1ファイル、スキットの配列）:
[
  {
    "id": "A1-01",
    "title": "Beyond the Stars!",
    "scene": "深夜のラボ。初対面。",
    "lines": [
      {"type": "narration", "speaker": "Narrator", "text": "A lab, late at night. A clock ticks."},
      {"type": "sfx", "text": "old clock ticking"},
      {"type": "dialog", "no": 1, "speaker": "Frank", "text": "Where... where exactly are you from?", "jp": "あなたは…一体どこから来たのですか？"}
    ]
  }, ...
]

使い方:
  python3 tools/extract_skits.py skits_A1_dialogs_jp.md -o build/skits_A1.json
"""
import argparse
import json
import re
import sys
from pathlib import Path

RE_HEADING = re.compile(r"^###\s+(?P<id>[AB][12]-\d{2})\s+(?P<title>.+?)(?:\s*[（(]旧 .+?[)）])?\s*$")
RE_SCENE = re.compile(r"^\*\*場面:\*\*\s*(?P<scene>.+)$")
RE_NARRATOR = re.compile(r"^\*\*Narrator\*\*:\s*(?P<text>.+)$")
RE_DIALOG = re.compile(r"^(?P<no>\d+)\.\s+\*\*(?P<speaker>[^*]+)\*\*:\s*(?P<text>.+)$")
RE_JP = re.compile(r"^\s+\*\*(?P<speaker>[^*]+)\*\*:\s*(?P<jp>.+)$")
RE_SFX = re.compile(r"^\s*`\[SFX:\s*(?P<sfx>[^\]]+)\]`\s*$")


def parse(md_path: Path):
    skits = []
    cur = None
    last_dialog = None
    for raw in md_path.read_text(encoding="utf-8").splitlines():
        m = RE_HEADING.match(raw)
        if m:
            cur = {"id": m["id"], "title": m["title"].strip(), "scene": "", "lines": []}
            skits.append(cur)
            last_dialog = None
            continue
        if cur is None:
            continue
        m = RE_SCENE.match(raw)
        if m:
            cur["scene"] = m["scene"].strip()
            continue
        m = RE_SFX.match(raw)
        if m:
            cur["lines"].append({"type": "sfx", "text": m["sfx"].strip()})
            continue
        m = RE_NARRATOR.match(raw)
        if m:
            cur["lines"].append({"type": "narration", "speaker": "Narrator", "text": m["text"].strip()})
            last_dialog = None
            continue
        m = RE_DIALOG.match(raw)
        if m:
            last_dialog = {
                "type": "dialog",
                "no": int(m["no"]),
                "speaker": m["speaker"].strip(),
                "text": m["text"].strip(),
                "jp": "",
            }
            cur["lines"].append(last_dialog)
            continue
        m = RE_JP.match(raw)
        if m and last_dialog is not None and not last_dialog["jp"]:
            last_dialog["jp"] = m["jp"].strip()
            continue
    return skits


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("markdown", type=Path)
    ap.add_argument("-o", "--out", type=Path, required=True)
    args = ap.parse_args()

    skits = parse(args.markdown)
    if not skits:
        sys.exit(f"error: no skits found in {args.markdown}")

    n_dialog = sum(1 for s in skits for l in s["lines"] if l["type"] == "dialog")
    missing_jp = [
        f"{s['id']}#{l['no']}" for s in skits for l in s["lines"]
        if l["type"] == "dialog" and not l["jp"]
    ]
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(skits, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"{args.markdown.name}: {len(skits)} skits, {n_dialog} dialog lines -> {args.out}")
    if missing_jp:
        print(f"warning: {len(missing_jp)} lines missing JP translation: {', '.join(missing_jp[:10])}", file=sys.stderr)


if __name__ == "__main__":
    main()
