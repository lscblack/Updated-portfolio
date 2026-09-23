"""Outbound email (SMTP with STARTTLS). Falls back to logging when disabled or misconfigured."""
from __future__ import annotations

import html
import logging
import smtplib
import ssl
from email.message import EmailMessage
from email.utils import formataddr

from .config import settings

log = logging.getLogger(__name__)


def _wrap(title: str, body_html: str, footer: str = "") -> str:
    return f"""<!doctype html><html><body style="margin:0;padding:32px 16px;background:#0c0a09;font-family:Inter,Segoe UI,Arial,sans-serif;color:#e7e5e4">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center">
<table role="presentation" width="520" style="max-width:520px;background:#1c1917;border:1px solid #292524;border-radius:14px;overflow:hidden">
<tr><td style="padding:22px 28px;border-bottom:1px solid #292524"><span style="font-weight:800;font-size:15px;letter-spacing:.12em;color:#f97316">{html.escape(settings.EMAIL_SENDER_NAME or 'Portfolio')}</span></td></tr>
<tr><td style="padding:28px"><h1 style="margin:0 0 14px;font-size:20px;color:#fafaf9">{html.escape(title)}</h1>{body_html}</td></tr>
<tr><td style="padding:16px 28px;border-top:1px solid #292524;font-size:12px;color:#78716c">{footer or 'This is an automated message.'}</td></tr>
</table></td></tr></table></body></html>"""


def send_email(to: str, subject: str, html_body: str, text_body: str = "") -> bool:
    if not settings.EMAIL_ENABLED or not settings.EMAIL_SMTP_SERVER:
        log.info("EMAIL (disabled) to=%s subject=%r\n%s", to, subject, text_body or html_body)
        return False
    msg = EmailMessage()
    msg["From"] = formataddr((settings.EMAIL_SENDER_NAME, settings.EMAIL_SENDER_EMAIL))
    msg["To"] = to
    msg["Subject"] = subject
    msg.set_content(text_body or "This message requires an HTML capable email client.")
    msg.add_alternative(html_body, subtype="html")
    try:
        ctx = ssl.create_default_context()
        if settings.EMAIL_SMTP_PORT == 465:
            server = smtplib.SMTP_SSL(settings.EMAIL_SMTP_SERVER, settings.EMAIL_SMTP_PORT, timeout=15, context=ctx)
        else:
            server = smtplib.SMTP(settings.EMAIL_SMTP_SERVER, settings.EMAIL_SMTP_PORT, timeout=15)
            server.ehlo()
            server.starttls(context=ctx)
            server.ehlo()
        with server:
            if settings.EMAIL_LOGIN or settings.EMAIL_SENDER_PASSWORD:
                server.login(settings.EMAIL_LOGIN or settings.EMAIL_SENDER_EMAIL, settings.EMAIL_SENDER_PASSWORD)
            server.send_message(msg)
        return True
    except Exception as e:
        log.error("Email to %s failed: %s", to, e)
        return False


def send_otp_email(to: str, name: str, code: str, minutes: int, ip: str = "") -> bool:
    digits = " ".join(code)
    body = f"""<p style="margin:0 0 18px;color:#a8a29e">Hi {html.escape(name or 'there')}, use this code to finish signing in to the dashboard.</p>
<div style="font-family:'JetBrains Mono',Menlo,monospace;font-size:34px;letter-spacing:.35em;font-weight:700;color:#fafaf9;background:#0c0a09;border:1px solid #44403c;border-radius:10px;padding:18px 20px;text-align:center">{digits}</div>
<p style="margin:18px 0 0;color:#78716c;font-size:13px">Expires in {minutes} minutes. If you did not request this, change your password immediately.{(' Request came from ' + html.escape(ip) + '.') if ip else ''}</p>"""
    return send_email(to, "Your sign-in code", _wrap("Sign-in verification", body), f"Your sign-in code is {code}. It expires in {minutes} minutes.")


def send_contact_notification(to: str, name: str, email: str, subject: str, message: str) -> bool:
    body = f"""<p style="margin:0 0 10px;color:#a8a29e"><b style="color:#fafaf9">From:</b> {html.escape(name)} &lt;{html.escape(email)}&gt;</p>
<p style="margin:0 0 18px;color:#a8a29e"><b style="color:#fafaf9">Subject:</b> {html.escape(subject)}</p>
<div style="white-space:pre-wrap;background:#0c0a09;border:1px solid #44403c;border-radius:10px;padding:16px;color:#e7e5e4;line-height:1.6">{html.escape(message)}</div>
<p style="margin:18px 0 0;font-size:13px;color:#78716c">Reply directly to this email or open the dashboard inbox.</p>"""
    return send_email(to, f"[Portfolio] {subject}", _wrap("New contact message", body), f"From: {name} <{email}>\nSubject: {subject}\n\n{message}")


def send_contact_receipt(to: str, name: str, subject: str) -> bool:
    body = f"""<p style="margin:0 0 12px;color:#a8a29e">Hi {html.escape(name)}, thanks for reaching out about <b style="color:#fafaf9">{html.escape(subject)}</b>.</p>
<p style="margin:0;color:#a8a29e">I read every message personally and usually reply within a couple of days.</p>"""
    return send_email(to, "Thanks for your message", _wrap("Message received", body), f"Hi {name}, thanks for your message about '{subject}'. I will get back to you soon.")


def send_offer_notification(to: str, offer: dict) -> bool:
    rows = "".join(f'<tr><td style="padding:4px 10px 4px 0;color:#78716c">{html.escape(k)}</td><td style="padding:4px 0;color:#fafaf9">{html.escape(str(v))}</td></tr>'
                   for k, v in offer.items() if k != "message" and v)
    body = f"""<p style="margin:0 0 14px;color:#a8a29e">Someone wants to work with you.</p>
<table style="font-size:14px;margin-bottom:16px">{rows}</table>
<div style="white-space:pre-wrap;background:#0c0a09;border:1px solid #44403c;border-radius:10px;padding:16px;color:#e7e5e4;line-height:1.6">{html.escape(offer.get("message", ""))}</div>
<p style="margin:18px 0 0;font-size:13px;color:#78716c">Review it in the dashboard under Offers.</p>"""
    text = "\n".join(f"{k}: {v}" for k, v in offer.items())
    return send_email(to, f"[Offer] {offer.get('title', 'New offer')} — {offer.get('name', '')}", _wrap("New offer received", body), text)


def send_offer_receipt(to: str, name: str, title: str) -> bool:
    body = f"""<p style="margin:0 0 12px;color:#a8a29e">Hi {html.escape(name)}, thank you for your proposal <b style="color:#fafaf9">{html.escape(title)}</b>.</p>
<p style="margin:0;color:#a8a29e">I review every offer personally and will reply by email within a few days.</p>"""
    return send_email(to, "Your offer was received", _wrap("Offer received", body), f"Hi {name}, thanks for your offer '{title}'. I will get back to you soon.")


def send_offer_status(to: str, name: str, title: str, status: str, reply: str = "") -> bool:
    label = {"accepted": "accepted", "declined": "declined", "reviewing": "under review"}.get(status, status)
    body = f"""<p style="margin:0 0 12px;color:#a8a29e">Hi {html.escape(name)}, an update on <b style="color:#fafaf9">{html.escape(title)}</b>: your offer is now <b style="color:#fafaf9">{html.escape(label)}</b>.</p>
{f'<div style="white-space:pre-wrap;background:#0c0a09;border:1px solid #44403c;border-radius:10px;padding:16px;color:#e7e5e4;line-height:1.6">{html.escape(reply)}</div>' if reply else ''}"""
    return send_email(to, f"Update on your offer: {label}", _wrap("Offer update", body), f"Hi {name}, your offer '{title}' is now {label}.\n\n{reply}")
