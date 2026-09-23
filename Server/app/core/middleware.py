"""Pure-ASGI middleware: security headers, HTTPS redirect, global rate limit and the encrypted payload envelope."""
from __future__ import annotations

import base64
import json
import os
from typing import Callable

from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from starlette.responses import JSONResponse
from starlette.types import ASGIApp, Message, Receive, Scope, Send

from .config import settings
from .security import derive_shared_key
from .store import rate_hit


def _hdrs(scope: Scope) -> dict[str, str]:
    return {k.decode("latin-1").lower(): v.decode("latin-1") for k, v in scope.get("headers", [])}


class SecurityHeadersMiddleware:
    def __init__(self, app: ASGIApp):
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send):
        if scope["type"] != "http":
            return await self.app(scope, receive, send)

        async def send_wrapper(message: Message):
            if message["type"] == "http.response.start":
                headers = list(message.get("headers", []))
                extra = {
                    b"x-content-type-options": b"nosniff",
                    b"x-frame-options": b"DENY",
                    b"referrer-policy": b"strict-origin-when-cross-origin",
                    b"permissions-policy": b"camera=(), microphone=(), geolocation=(), payment=(), fullscreen=(self)",
                    b"cross-origin-opener-policy": b"same-origin",
                    b"cross-origin-resource-policy": b"cross-origin",
                    b"x-permitted-cross-domain-policies": b"none",
                    b"cache-control": b"no-store",
                }
                path = scope.get("path", "")
                if path.startswith("/uploads/"):
                    extra[b"cache-control"] = b"public, max-age=604800, immutable"
                    # uploads are embedded by the site (the resume is shown in an iframe), so framing
                    # must be allowed for our own origins instead of blanket-denied
                    extra.pop(b"x-frame-options", None)
                    extra[b"content-security-policy"] = (
                        "default-src 'none'; img-src 'self' data:; object-src 'self'; plugin-types application/pdf; "
                        f"frame-ancestors 'self' {' '.join(settings.frame_ancestors)}".strip()
                    ).encode()
                elif path == "/api/public/site":
                    extra[b"cache-control"] = b"public, max-age=60"
                    extra[b"content-security-policy"] = b"default-src 'none'; frame-ancestors 'none'; img-src 'self' data:"
                # everything else keeps no-store: captcha ids are single use, and a cached one
                # would be replayed and rejected on the next submission
                elif path in ("/docs", "/redoc", "/openapi.json") or path.startswith("/docs/"):
                    extra.pop(b"x-frame-options", None)   # swagger UI loads its own assets
                else:
                    extra[b"content-security-policy"] = b"default-src 'none'; frame-ancestors 'none'; img-src 'self' data:"
                if settings.is_production or settings.FORCE_HTTPS:
                    extra[b"strict-transport-security"] = b"max-age=31536000; includeSubDomains"
                existing = {k.lower() for k, _ in headers}
                for k, v in extra.items():
                    if k not in existing:
                        headers.append((k, v))
                message["headers"] = headers
            await send(message)

        await self.app(scope, receive, send_wrapper)


class HTTPSRedirectMiddleware:
    """Redirect plain HTTP when FORCE_HTTPS is set (proxy-aware via X-Forwarded-Proto)."""

    def __init__(self, app: ASGIApp):
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send):
        if scope["type"] == "http" and (settings.FORCE_HTTPS or settings.is_production):
            h = _hdrs(scope)
            proto = h.get("x-forwarded-proto", scope.get("scheme", "http"))
            host = h.get("host", "")
            local = host.split(":")[0] in ("127.0.0.1", "localhost")
            if proto == "http" and not local:
                url = f"https://{host}{scope.get('raw_path', b'/').decode()}"
                if scope.get("query_string"):
                    url += "?" + scope["query_string"].decode()
                resp = JSONResponse({"detail": "HTTPS required"}, status_code=307, headers={"Location": url})
                return await resp(scope, receive, send)
        await self.app(scope, receive, send)


class GlobalRateLimitMiddleware:
    def __init__(self, app: ASGIApp):
        self.app = app
        self.limit, self.window = settings.rate_global

    async def __call__(self, scope: Scope, receive: Receive, send: Send):
        if scope["type"] == "http" and not scope.get("path", "").startswith("/uploads/"):
            client = scope.get("client") or ("0.0.0.0", 0)
            ip = client[0]
            if ip in ("127.0.0.1", "::1"):
                ip = _hdrs(scope).get("x-real-ip", ip)
            allowed, remaining = rate_hit(f"global:{ip}", self.limit, self.window)
            if not allowed:
                resp = JSONResponse({"detail": "Too many requests"}, status_code=429, headers={"Retry-After": str(self.window)})
                return await resp(scope, receive, send)
        await self.app(scope, receive, send)


def _b64d(s: str) -> bytes:
    return base64.b64decode(s + "=" * (-len(s) % 4))


def _b64e(b: bytes) -> str:
    return base64.b64encode(b).decode()


class PayloadEnvelopeMiddleware:
    """Optional end-to-end envelope: the client ECDH-derives an AES-256-GCM key with the server's P-256 key,
    encrypts the JSON body as {v, epk, iv, ct} and sets `X-Payload-Encryption: v1`. The response is
    encrypted with the same key. Requests without the header pass through untouched."""

    def __init__(self, app: ASGIApp):
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send):
        if scope["type"] != "http" or not settings.PAYLOAD_ENCRYPTION:
            return await self.app(scope, receive, send)
        h = _hdrs(scope)
        if h.get("x-payload-encryption") != "v1":
            return await self.app(scope, receive, send)

        body = b""
        while True:
            msg = await receive()
            body += msg.get("body", b"")
            if not msg.get("more_body"):
                break
        try:
            env = json.loads(body) if body.strip() else {}
            epk = env.get("epk") or h.get("x-payload-key", "")
            key = derive_shared_key(epk)
            aes = AESGCM(key)
            plain = aes.decrypt(_b64d(env["iv"]), _b64d(env["ct"]), None) if env.get("ct") else b""
        except Exception:
            resp = JSONResponse({"detail": "Bad encrypted envelope"}, status_code=400)
            return await resp(scope, receive, send)

        headers = [(k, v) for k, v in scope["headers"] if k.lower() != b"content-length"]
        if plain:
            headers = [(k, v) for k, v in headers if k.lower() != b"content-type"]
            headers.append((b"content-type", b"application/json"))
            headers.append((b"content-length", str(len(plain)).encode()))
        new_scope = dict(scope); new_scope["headers"] = headers

        delivered = False

        async def new_receive() -> Message:
            nonlocal delivered
            if not delivered:
                delivered = True
                return {"type": "http.request", "body": plain, "more_body": False}
            return await receive()

        start: Message | None = None
        chunks: list[bytes] = []

        async def new_send(message: Message):
            nonlocal start
            if message["type"] == "http.response.start":
                start = message
                return
            if message["type"] == "http.response.body":
                chunks.append(message.get("body", b""))
                if message.get("more_body"):
                    return
                assert start is not None
                iv = os.urandom(12)
                out = json.dumps({"v": 1, "iv": _b64e(iv), "ct": _b64e(aes.encrypt(iv, b"".join(chunks), None))}).encode()
                hdrs = [(k, v) for k, v in start.get("headers", []) if k.lower() not in (b"content-length", b"content-type")]
                hdrs += [(b"content-type", b"application/json"), (b"content-length", str(len(out)).encode()), (b"x-payload-encryption", b"v1")]
                await send({"type": "http.response.start", "status": start["status"], "headers": hdrs})
                await send({"type": "http.response.body", "body": out, "more_body": False})
                return
            await send(message)

        await self.app(new_scope, new_receive, new_send)
