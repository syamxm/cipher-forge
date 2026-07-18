from pydantic import BaseModel, Field


class RegisterRequest(BaseModel):
    username: str = Field(min_length=3, max_length=20, pattern=r"^[a-zA-Z0-9_]+$")
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: str
    username: str

class StartRequest(BaseModel):
    difficulty: str = Field(pattern=r"^(easy|medium|hard)$")
 
 
class Stage1Request(BaseModel):
    run_id: str
    p: int
    q: int
 
 
class Stage2Request(BaseModel):
    run_id: str
    e: int
    d: int = Field(gt=0)
 
 
class Stage3Request(BaseModel):
    run_id: str
    message: str = Field(min_length=1, max_length=200)
 
 
class Stage4Request(BaseModel):
    run_id: str
    d: int = Field(gt=0)
 