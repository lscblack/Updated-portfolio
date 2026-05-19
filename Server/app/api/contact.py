from fastapi import APIRouter
from pydantic import BaseModel, EmailStr
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


class ContactMessage(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str


@router.post("/contact")
def send_contact(payload: ContactMessage):
    logger.info(
        "Contact form submission — from=%s <%s> subject=%r",
        payload.name,
        payload.email,
        payload.subject,
    )
    print(f"\n📬 New contact message\n  From: {payload.name} <{payload.email}>\n  Subject: {payload.subject}\n  Message: {payload.message}\n")
    return {"success": True, "message": "Message received!"}
