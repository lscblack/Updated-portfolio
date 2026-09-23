"""Minimal user-agent classification — enough for a device/browser breakdown without a dependency."""
from __future__ import annotations

import re

_BROWSERS = [
    ("Edge", r"Edg[eA]?/"), ("Opera", r"OPR/|Opera"), ("Samsung Internet", r"SamsungBrowser"),
    ("Chrome", r"Chrome/|CriOS"), ("Firefox", r"Firefox/|FxiOS"), ("Safari", r"Safari/"),
]
_OS = [
    ("Android", r"Android"), ("iOS", r"iPhone|iPad|iPod"), ("Windows", r"Windows NT"),
    ("macOS", r"Mac OS X|Macintosh"), ("Linux", r"Linux"), ("Chrome OS", r"CrOS"),
]
_BOT = re.compile(r"bot|crawler|spider|crawl|slurp|facebookexternalhit|preview|monitor|curl|wget|python-requests|headless", re.I)


def is_bot(ua: str) -> bool:
    return bool(_BOT.search(ua or ""))


def classify(ua: str) -> tuple[str, str, str]:
    """Return (device, browser, os)."""
    ua = ua or ""
    if re.search(r"iPad|Tablet|Silk", ua, re.I):
        device = "tablet"
    elif re.search(r"Mobi|Android|iPhone|iPod", ua, re.I):
        device = "mobile"
    else:
        device = "desktop"
    browser = next((name for name, pat in _BROWSERS if re.search(pat, ua)), "Other")
    os_name = next((name for name, pat in _OS if re.search(pat, ua)), "Other")
    return device, browser, os_name
