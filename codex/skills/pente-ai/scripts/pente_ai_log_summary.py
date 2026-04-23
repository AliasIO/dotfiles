#!/usr/bin/env python3
"""Summarize Pente AI DEBUG JSONL logs from an iOS simulator container."""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from collections import defaultdict
from pathlib import Path
from typing import Any


DEFAULT_BUNDLE_ID = "io.alias.pente"


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []

    if not path.exists():
        return rows

    with path.open("r", encoding="utf-8") as handle:
        for line_number, line in enumerate(handle, start=1):
            line = line.strip()

            if not line:
                continue

            try:
                value = json.loads(line)
            except json.JSONDecodeError as error:
                print(f"warning: skipped invalid JSON at {path}:{line_number}: {error}", file=sys.stderr)
                continue

            if isinstance(value, dict):
                rows.append(value)

    return rows


def simulator_data_dir(device: str, bundle_id: str) -> Path:
    command = ["xcrun", "simctl", "get_app_container", device, bundle_id, "data"]
    result = subprocess.run(command, text=True, capture_output=True, check=False)

    if result.returncode != 0:
        message = result.stderr.strip() or result.stdout.strip() or "simctl failed"
        raise SystemExit(f"failed to locate simulator app container: {message}")

    return Path(result.stdout.strip())


def move_text(move: dict[str, Any] | None) -> str:
    if not move:
        return "-"

    return f"({move.get('x')},{move.get('y')})#{move.get('index')}"


def player_text(player: Any) -> str:
    return {
        0: "human",
        1: "computer",
        "0": "human",
        "1": "computer",
        None: "-",
    }.get(player, str(player))


def compact_board(board: dict[str, Any] | None) -> str:
    if not board:
        return ""

    compact = board.get("compact")

    if not isinstance(compact, str) or len(compact) != 361:
        return ""

    lines = []

    for y in range(19):
        row = compact[y * 19 : (y + 1) * 19]
        lines.append(f"{y:02d} {row}")

    return "\n".join(lines)


def top_group_names(decision: dict[str, Any], limit: int = 8) -> list[str]:
    names: list[str] = []

    for group in decision.get("groups") or []:
        moves = group.get("moves") or []

        if moves:
            names.append(f"{group.get('name')}:{len(moves)}")

        if len(names) >= limit:
            break

    return names


def exceeded_phase_names(decision: dict[str, Any], limit: int = 6) -> list[str]:
    phases = []

    for phase in decision.get("phases") or []:
        if phase.get("exceededDeadline"):
            phases.append(f"{phase.get('name')}:{phase.get('durationMs')}ms")

        if len(phases) >= limit:
            break

    return phases


def group_decisions(decisions: list[dict[str, Any]]) -> dict[tuple[str, int], list[dict[str, Any]]]:
    grouped: dict[tuple[str, int], list[dict[str, Any]]] = defaultdict(list)

    for decision in decisions:
        context = decision.get("context") or {}
        game_id = context.get("gameId")
        move_number = context.get("moveNumber")

        if isinstance(game_id, str) and isinstance(move_number, int):
            grouped[(game_id, move_number)].append(decision)

    for key in grouped:
        grouped[key].sort(key=lambda row: row.get("timestamp", 0))

    return grouped


def committed_moves(events: list[dict[str, Any]], game_id: str) -> list[dict[str, Any]]:
    return [
        event
        for event in events
        if event.get("gameId") == game_id and event.get("event") in {"humanMoveCommitted", "aiMoveCommitted"}
    ]


def latest_game_id(events: list[dict[str, Any]]) -> str | None:
    latest: dict[str, Any] | None = None

    for event in events:
        if not event.get("gameId"):
            continue

        if latest is None or event.get("timestamp", 0) > latest.get("timestamp", 0):
            latest = event

    if latest:
        return latest.get("gameId")

    return None


def list_games(events: list[dict[str, Any]]) -> None:
    summaries: dict[str, dict[str, Any]] = {}

    for event in events:
        game_id = event.get("gameId")

        if not isinstance(game_id, str):
            continue

        summary = summaries.setdefault(
            game_id,
            {
                "first": event.get("timestamp", 0),
                "last": event.get("timestamp", 0),
                "events": 0,
                "difficulty": event.get("difficulty"),
                "winner": None,
                "moveNumber": None,
            },
        )
        summary["events"] += 1
        summary["first"] = min(summary["first"], event.get("timestamp", summary["first"]))
        summary["last"] = max(summary["last"], event.get("timestamp", summary["last"]))
        summary["difficulty"] = summary["difficulty"] or event.get("difficulty")

        after = event.get("after") or {}

        if isinstance(after, dict):
            summary["winner"] = after.get("winner", summary["winner"])
            summary["moveNumber"] = after.get("moveNumber", summary["moveNumber"])

    for game_id, summary in sorted(summaries.items(), key=lambda item: item[1]["last"], reverse=True):
        winner = summary["winner"]
        winner_label = player_text(winner) if winner is not None else "-"
        print(
            f"{game_id} events={summary['events']} last={summary['last']:.3f} "
            f"difficulty={summary['difficulty']} moves={summary['moveNumber']} winner={winner_label}"
        )


def summarize_game(
    events: list[dict[str, Any]],
    decisions: list[dict[str, Any]],
    game_id: str,
    reverse: bool,
    show_board: bool,
) -> None:
    moves = committed_moves(events, game_id)
    decision_map = group_decisions(decisions)

    if not moves:
        raise SystemExit(f"no committed moves found for game {game_id}")

    ordered_moves = list(reversed(moves)) if reverse else moves
    final_after = moves[-1].get("after") or {}
    winner = final_after.get("winner")
    move_count = final_after.get("moveNumber")
    print(f"gameId={game_id} moves={move_count} winner={player_text(winner) if winner is not None else '-'}")
    print()

    for event in ordered_moves:
        move_number = event.get("moveNumber")
        player = event.get("player")
        move = event.get("move")
        captured = event.get("captured") or []
        after = event.get("after") or {}
        winner = after.get("winner")
        captures = after.get("captures")
        line = (
            f"{move_number:>3} {event.get('event'):<18} "
            f"{player_text(player):<8} move={move_text(move):<12} "
            f"captures={captures} captured={len(captured)}"
        )

        if winner is not None:
            line += f" winner={player_text(winner)}"

        print(line)

        for decision in decision_map.get((game_id, move_number), []):
            selected = move_text(decision.get("selected"))
            reason = decision.get("reason")
            duration = decision.get("durationMs")
            groups = ", ".join(top_group_names(decision)) or "-"
            exceeded = ", ".join(exceeded_phase_names(decision)) or "-"
            print(f"    ai decision: selected={selected} reason={reason} duration={duration}ms")
            print(f"    groups: {groups}")

            if exceeded != "-":
                print(f"    deadline phases: {exceeded}")

            candidates = decision.get("candidates") or []

            if candidates:
                tagged = [
                    f"{move_text(candidate.get('move'))}:{'|'.join(candidate.get('tags') or [])}"
                    for candidate in candidates[:8]
                ]
                print(f"    candidates: {', '.join(tagged)}")

        if show_board:
            board = compact_board(event.get("before") if reverse else event.get("after"))

            if board:
                print(board)

        print()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--device", default="booted", help="simulator UDID or 'booted'")
    parser.add_argument("--bundle-id", default=DEFAULT_BUNDLE_ID)
    parser.add_argument("--data-dir", type=Path, help="app data container path; bypasses simctl")
    parser.add_argument("--game-id", help="gameId to summarize")
    parser.add_argument("--latest", action="store_true", help="summarize the latest game")
    parser.add_argument("--list-games", action="store_true", help="list games and exit")
    parser.add_argument("--reverse", action="store_true", help="print moves newest first")
    parser.add_argument("--show-board", action="store_true", help="print compact 19x19 boards")
    args = parser.parse_args()

    data_dir = args.data_dir or simulator_data_dir(args.device, args.bundle_id)
    documents = data_dir / "Documents"
    game_log = documents / "ai-game-log.jsonl"
    decision_log = documents / "ai-decision-log.jsonl"
    events = load_jsonl(game_log)
    decisions = load_jsonl(decision_log)

    if not events:
        raise SystemExit(f"no game events found at {game_log}")

    if args.list_games:
        list_games(events)
        return 0

    game_id = args.game_id

    if args.latest or not game_id:
        game_id = latest_game_id(events)

    if not game_id:
        raise SystemExit("no gameId found; use --list-games to inspect logs")

    summarize_game(events, decisions, game_id, reverse=args.reverse, show_board=args.show_board)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
