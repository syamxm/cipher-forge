from fastapi import APIRouter, Depends, HTTPException, status
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token
from pymongo.errors import DuplicateKeyError

from ..config import settings
from ..db import db
from ..deps import get_current_user
from ..schemas import (
    GoogleLoginRequest,
    LoginRequest,
    RegisterRequest,
    SetUsernameRequest,
    TokenResponse,
    UserResponse,
)
from ..security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


def serialize_user(user: dict) -> UserResponse:
    return UserResponse(
        id=str(user["_id"]),
        email=user["email"],
        username=user.get("username"),
        auth_provider=user["auth_provider"],
    )


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(body: RegisterRequest):
    user = {
        "email": body.email.lower(),
        "password_hash": hash_password(body.password),
        "username": None,
        "auth_provider": "email",
    }
    try:
        result = await db.users.insert_one(user)
    except DuplicateKeyError:
        raise HTTPException(status.HTTP_409_CONFLICT, "Email already registered")
    return TokenResponse(access_token=create_access_token(str(result.inserted_id)))


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest):
    user = await db.users.find_one({"email": body.email.lower()})
    if user is None or not user.get("password_hash"):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password")
    if not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password")
    return TokenResponse(access_token=create_access_token(str(user["_id"])))


@router.post("/google", response_model=TokenResponse)
async def google_login(body: GoogleLoginRequest):
    if not settings.google_client_id:
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE, "Google auth not configured"
        )
    try:
        info = google_id_token.verify_oauth2_token(
            body.id_token, google_requests.Request(), settings.google_client_id
        )
    except ValueError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid Google token")

    email = info["email"].lower()
    user = await db.users.find_one({"email": email})
    if user is None:
        result = await db.users.insert_one(
            {
                "email": email,
                "password_hash": None,
                "username": None,
                "auth_provider": "google",
            }
        )
        user_id = result.inserted_id
    else:
        user_id = user["_id"]
    return TokenResponse(access_token=create_access_token(str(user_id)))


@router.get("/me", response_model=UserResponse)
async def me(user: dict = Depends(get_current_user)):
    return serialize_user(user)


@router.patch("/me/username", response_model=UserResponse)
async def set_username(body: SetUsernameRequest, user: dict = Depends(get_current_user)):
    existing = await db.users.find_one({"username": body.username})
    if existing and existing["_id"] != user["_id"]:
        raise HTTPException(status.HTTP_409_CONFLICT, "Username already taken")
    await db.users.update_one(
        {"_id": user["_id"]}, {"$set": {"username": body.username}}
    )
    user["username"] = body.username
    return serialize_user(user)
