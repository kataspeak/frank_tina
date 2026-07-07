#!/usr/bin/env python3
"""extract_skits.py の JSON を ElevenLabs で音声化する。

- 台詞・ナレーション: Text-to-Speech API（eleven_v3。[excited] 等の演技指示は
  v3 の audio tags としてそのまま解釈される）
- 効果音 [SFX: ...]: --sfx 指定時に Sound Effects API で別ファイル生成
- 出力: 1行 = 1 mp3（<out>/<skit_id>/<seq>_<speaker>.mp3）+ manifest.json
  行単位ファイルなので、アプリ側のフレーズ単位判定にそのまま載せられる。

使い方:
  export ELEVENLABS_API_KEY=...
  python3 tools/synthesize.py build/skits_A1.json -o build/audio_A1 \
      --voices tools/voices.json --only A1-01 A1-02 --sfx

前提: pip install requests
"""
import argparse
import json
import os
import re
import sys
import time
from pathlib import Path

import requests

API_BASE = "https://api.elevenlabs.io/v1"
TAG_RE = re.compile(r"\[[^\]]+\]\s*")


def slug(name: str) -> str:
    return re.sub(r"[^A-Za-z0-9]+", "_", name).strip("_")


def resolve_voice(speaker: str, cfg: dict) -> tuple[str, dict]:
    voices = cfg["voices"]
    if speaker in voices:
        v = voices[speaker]
    else:
        hints = cfg.get("gender_hints", {})
        key = "default_female" if speaker in hints.get("female", []) else "default_male"
        v = voices[key]
    return v["voice_id"], v.get("settings", {})


def post_with_retry(url: str, headers: dict, payload: dict, retries: int = 4) -> bytes:
    for attempt in range(retries):
        r = requests.post(url, headers=headers, json=payload, timeout=120)
        if r.status_code == 200:
            return r.content
        if r.status_code == 429 or r.status_code >= 500:
            wait = 2 ** (attempt + 1)
            print(f"  HTTP {r.status_code}, retrying in {wait}s...", file=sys.stderr)
            time.sleep(wait)
            continue
        raise RuntimeError(f"HTTP {r.status_code}: {r.text[:300]}")
    raise RuntimeError(f"gave up after {retries} retries: {url}")


def tts(text: str, voice_id: str, settings: dict, cfg: dict, api_key: str, lang: str | None) -> bytes:
    payload = {
        "text": text,
        "model_id": cfg.get("model_id", "eleven_v3"),
        "voice_settings": settings,
    }
    if lang:
        payload["language_code"] = lang
    url = f"{API_BASE}/text-to-speech/{voice_id}?output_format={cfg.get('output_format', 'mp3_44100_128')}"
    return post_with_retry(url, {"xi-api-key": api_key}, payload)


def sound_effect(prompt: str, api_key: str) -> bytes:
    return post_with_retry(f"{API_BASE}/sound-generation", {"xi-api-key": api_key},
                           {"text": prompt, "duration_seconds": 3.0})


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("skits_json", type=Path)
    ap.add_argument("-o", "--out", type=Path, required=True)
    ap.add_argument("--voices", type=Path, default=Path(__file__).parent / "voices.json")
    ap.add_argument("--only", nargs="*", help="生成対象のスキットID (例: A1-01)")
    ap.add_argument("--sfx", action="store_true", help="効果音も生成する")
    ap.add_argument("--strip-tags", action="store_true",
                    help="[tag] を除去して送る（v3 以外のモデルを使う場合）")
    ap.add_argument("--lang", default=None,
                    help="language_code (例: ko, es)。多言語版台本を音声化する際に指定")
    args = ap.parse_args()

    api_key = os.environ.get("ELEVENLABS_API_KEY")
    if not api_key:
        sys.exit("error: ELEVENLABS_API_KEY が未設定です")

    cfg = json.loads(args.voices.read_text(encoding="utf-8"))
    unreplaced = [k for k, v in cfg["voices"].items() if v["voice_id"].startswith("REPLACE")]
    if unreplaced:
        sys.exit(f"error: voices.json の voice_id が未設定です: {', '.join(unreplaced)}")

    skits = json.loads(args.skits_json.read_text(encoding="utf-8"))
    if args.only:
        skits = [s for s in skits if s["id"] in set(args.only)]
        if not skits:
            sys.exit("error: --only に一致するスキットがありません")

    for skit in skits:
        out_dir = args.out / skit["id"]
        out_dir.mkdir(parents=True, exist_ok=True)
        manifest = {"id": skit["id"], "title": skit["title"], "scene": skit["scene"], "files": []}
        print(f"== {skit['id']} {skit['title']}")
        for seq, line in enumerate(skit["lines"], start=1):
            if line["type"] == "sfx":
                if not args.sfx:
                    continue
                fname = f"{seq:02d}_SFX_{slug(line['text'])[:40]}.mp3"
                path = out_dir / fname
                if not path.exists():
                    path.write_bytes(sound_effect(line["text"], api_key))
                    print(f"  sfx  {fname}")
                manifest["files"].append({"seq": seq, "type": "sfx", "file": fname, "text": line["text"]})
                continue

            speaker = line["speaker"]
            text = line["text"]
            if args.strip_tags:
                text = TAG_RE.sub("", text).strip()
            voice_id, settings = resolve_voice(speaker, cfg)
            fname = f"{seq:02d}_{slug(speaker)}.mp3"
            path = out_dir / fname
            if not path.exists():
                path.write_bytes(tts(text, voice_id, settings, cfg, api_key, args.lang))
                print(f"  tts  {fname}  ({speaker})")
            manifest["files"].append({
                "seq": seq, "type": line["type"], "speaker": speaker,
                "file": fname, "text": line["text"], "jp": line.get("jp", ""),
            })
        (out_dir / "manifest.json").write_text(
            json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print("done.")


if __name__ == "__main__":
    main()
