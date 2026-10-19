import os
import secrets
from typing import Optional

from fastapi import Header, HTTPException


def require_admin_token(x_admin_token: Optional[str] = Header(default=None)) -> None:
    """Allow the request only if the X-Admin-Token header matches the ADMIN_TOKEN variable.

    If ADMIN_TOKEN is not set on the server, admin endpoints are closed for everyone.
    compare_digest compares in constant time, so the token cannot be guessed byte by byte.
    """
    expected = os.getenv("ADMIN_TOKEN")
    if not expected or not x_admin_token or not secrets.compare_digest(x_admin_token, expected):
        raise HTTPException(status_code=403, detail="Forbidden")
