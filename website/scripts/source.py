"""Strict, source-located conversion of the canonical bilingual Markdown."""
import hashlib
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
LEVELS = ("A1", "A2")
HEADER = re.compile(r"^### (A[12]-\d{2}) (.+)$")
SPEECH = re.compile(r"^(?:(\d+)\. )?\*\*([^*]+)\*\*:\s*(.*)$")
TAG = re.compile(r"\[([^\[\]]+)\]")
# Explicit allow-list from docs/skits_sitcom_style_guide.md §C. Unknown tags fail.
DIRECTIONS = {"sighs", "laughs", "chuckles", "whispers", "playful", "sarcastic", "excited", "nervous", "deadpan"}

class SourceError(ValueError):
    pass

def source_error(file, episode, line, message):
    raise SourceError(f"{file}:{line} [{episode}] {message}")

def segments(text, file, episode, line):
    result, cursor = [], 0
    for match in TAG.finditer(text):
        if match.start() > cursor:
            result.append({"type": "text", "text": text[cursor:match.start()]})
        tag = match[1]
        if tag.startswith("SFX: "):
            result.append({"type": "sfx", "text": tag[5:]})
        elif tag in DIRECTIONS:
            result.append({"type": "direction", "text": tag})
        else:
            source_error(file, episode, line, f"未知の角括弧タグ: [{tag}]")
        cursor = match.end()
    if cursor < len(text):
        result.append({"type": "text", "text": text[cursor:]})
    if any("[" in s["text"] or "]" in s["text"] for s in result if s["type"] == "text"):
        source_error(file, episode, line, "対応しない角括弧")
    return result

def spoken_text(parts):
    return re.sub(r" {2,}", " ", "".join(s["text"] for s in parts if s["type"] == "text")).strip()

def parse_sources():
    episodes, digest, source_notes = [], hashlib.sha256(), []
    for level in LEVELS:
        path = ROOT / f"skits/skits_{level}_dialogs_jp.md"
        raw = path.read_bytes(); digest.update(level.encode() + b"\0" + raw)
        lines = raw.decode("utf-8").splitlines()
        relative = path.relative_to(ROOT).as_posix()
        starts = [(i, HEADER.fullmatch(line)) for i, line in enumerate(lines) if HEADER.fullmatch(line)]
        ids = [m[1] for _, m in starts]
        expected = [f"{level}-{n:02d}" for n in range(1, 61)]
        if ids != expected:
            source_error(relative, level, 1, "60話のID集合またはプレイ順が期待値と異なります")
        for pos, (start, match) in enumerate(starts):
            end = starts[pos + 1][0] if pos + 1 < len(starts) else len(lines)
            ep = {"id": match[1], "title": match[2], "level": level, "order": len(episodes) + 1,
                  "source": {"file": relative, "line": start + 1}, "scene": None, "blocks": []}
            i, dialogue_number = start + 1, 0
            while i < end:
                line = lines[i].strip(); line_no = i + 1
                if not line or line == "---":
                    i += 1; continue
                if line.startswith(("> **設定（A1-48〜58）:** ", "> **注釈 — “That one is mine. I’m keeping it.”**: ")):
                    source_notes.append({"file": relative, "line": line_no, "text": line, "handling": "既知の制作設定メモ。本文には出力しない"})
                    i += 1; continue
                if line.startswith("**場面:** "):
                    if ep["scene"]:
                        source_error(relative, ep["id"], line_no, "場面が重複しています")
                    ep["scene"] = line[len("**場面:** "):]; i += 1; continue
                if re.fullmatch(r"`?\[SFX: [^\]]+\]`?", line):
                    ep["blocks"].append({"type": "sfx", "text": line.strip("`")[6:-1], "sourceLine": line_no})
                    i += 1; continue
                speech = SPEECH.fullmatch(line)
                if not speech or not re.fullmatch(r"[A-Za-z][A-Za-z .'’()/-]*", speech[2]):
                    source_error(relative, ep["id"], line_no, f"未知の行書式: {line}")
                number, speaker, en = speech.groups()
                if speaker != "Narrator":
                    dialogue_number += 1
                    if number != str(dialogue_number):
                        source_error(relative, ep["id"], line_no, "台詞番号の欠落・重複")
                elif number:
                    source_error(relative, ep["id"], line_no, "ナレーションに台詞番号があります")
                parts = segments(en, relative, ep["id"], line_no)
                i += 1
                if i >= end:
                    source_error(relative, ep["id"], line_no, "和訳がありません")
                jp = SPEECH.fullmatch(lines[i].strip())
                if not jp or jp[1] or not re.search(r"[ぁ-んァ-ヶ一-龯]", jp[2]) or not jp[3]:
                    source_error(relative, ep["id"], i + 1, "英文直下の和訳を特定できません")
                if "[" in jp[3] or "]" in jp[3]:
                    source_error(relative, ep["id"], i + 1, "和訳に制作タグがあります")
                if speaker in {"Frank", "Tina", "Narrator"} and jp[2] != {"Frank":"フランク", "Tina":"ティナ", "Narrator":"ナレーター"}[speaker]:
                    source_error(relative, ep["id"], i + 1, "英日話者が一致しません")
                ep["blocks"].append({"type": "narration" if speaker == "Narrator" else "dialogue",
                    "number": int(number) if number else None, "speaker": speaker, "speakerJa": jp[2],
                    "en": spoken_text(parts), "ja": jp[3], "segments": parts, "sourceLine": line_no, "translationLine": i + 1})
                i += 1
            if not ep["scene"] or not dialogue_number or sum(b["type"] == "narration" for b in ep["blocks"]) != 1:
                source_error(relative, ep["id"], start + 1, "場面・会話・冒頭ナレーションが不完全です")
            ep["sourceRevision"] = hashlib.sha256("\n".join(lines[start:end]).strip().encode()).hexdigest()
            episodes.append(ep)
    return {"schemaVersion": 1, "materialRevision": digest.hexdigest(), "sourceNotes": source_notes, "episodes": episodes}

if __name__ == "__main__":
    import json
    print(json.dumps(parse_sources(), ensure_ascii=False, indent=2))
