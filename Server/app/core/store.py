"""Shared key/value helpers (Redis when configured, in-process fallback): cache + rate limiting."""
from __future__ import annotations

import json
import logging
import threading
import time
from typing import Any, Optional

from .config import settings

log = logging.getLogger(__name__)

_redis = None
_redis_checked = False
_mem: dict[str, tuple[float, Any]] = {}
_lock = threading.Lock()


def redis_client():
    global _redis, _redis_checked
    if _redis_checked:
        return _redis
    _redis_checked = True
    if not settings.REDIS_URL:
        return None
    try:
        import redis  # type: ignore
        client = redis.Redis.from_url(settings.REDIS_URL, socket_connect_timeout=1, socket_timeout=1)
        client.ping()
        _redis = client
        log.info("Redis connected (%s)", settings.REDIS_URL.split("@")[-1])
    except Exception as e:  # pragma: no cover
        log.warning("Redis unavailable (%s) — using in-memory store", e)
        _redis = None
    return _redis


def _prune():
    now = time.time()
    dead = [k for k, (exp, _) in _mem.items() if exp and exp < now]
    for k in dead:
        _mem.pop(k, None)


# ── cache ──────────────────────────────────────────────────────────────────
def cache_get(key: str) -> Optional[Any]:
    r = redis_client()
    if r is not None:
        try:
            raw = r.get("cache:" + key)
            return json.loads(raw) if raw else None
        except Exception:
            return None
    with _lock:
        item = _mem.get("cache:" + key)
        if not item:
            return None
        exp, val = item
        if exp and exp < time.time():
            _mem.pop("cache:" + key, None)
            return None
        return val


def cache_set(key: str, value: Any, ttl: Optional[int] = None) -> None:
    ttl = ttl if ttl is not None else settings.CACHE_TTL_SECONDS
    r = redis_client()
    if r is not None:
        try:
            r.setex("cache:" + key, max(1, ttl), json.dumps(value, default=str))
            return
        except Exception:
            pass
    with _lock:
        if len(_mem) > 2000:
            _prune()
        _mem["cache:" + key] = (time.time() + ttl, value)


def cache_clear(prefix: str = "") -> None:
    r = redis_client()
    if r is not None:
        try:
            keys = list(r.scan_iter(f"cache:{prefix}*"))
            if keys:
                r.delete(*keys)
        except Exception:
            pass
    with _lock:
        for k in [k for k in _mem if k.startswith("cache:" + prefix)]:
            _mem.pop(k, None)


# ── sliding-window rate limit ──────────────────────────────────────────────
def rate_hit(bucket: str, limit: int, window: int) -> tuple[bool, int]:
    """Register a hit. Returns (allowed, remaining)."""
    r = redis_client()
    key = f"rl:{bucket}"
    if r is not None:
        try:
            pipe = r.pipeline()
            pipe.incr(key)
            pipe.expire(key, window, nx=True)
            count = pipe.execute()[0]
            return count <= limit, max(0, limit - int(count))
        except Exception:
            pass
    now = time.time()
    with _lock:
        exp, count = _mem.get(key, (0, 0))
        if not exp or exp < now:
            exp, count = now + window, 0
        count += 1
        _mem[key] = (exp, count)
        if len(_mem) > 5000:
            _prune()
    return count <= limit, max(0, limit - count)


def kv_set(key: str, value: Any, ttl: int) -> None:
    cache_set("kv:" + key, value, ttl)


def kv_get(key: str) -> Optional[Any]:
    return cache_get("kv:" + key)


def kv_del(key: str) -> None:
    cache_clear("kv:" + key)
