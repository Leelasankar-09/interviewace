from passlib.context import CryptContext
from jose import jwt, JWTError
import datetime
from .config import settings

SECRET = settings.JWT_SECRET
ALGORITHM = settings.JWT_ALGORITHM
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_ctx.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_ctx.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    exp = datetime.datetime.utcnow() + datetime.timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({**data, "exp": exp, "type": "access"}, SECRET, algorithm=ALGORITHM)

def create_refresh_token(data: dict) -> str:
    exp = datetime.datetime.utcnow() + datetime.timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    return jwt.encode({**data, "exp": exp, "type": "refresh"}, SECRET, algorithm=ALGORITHM)

def create_verification_token(data: dict) -> str:
    exp = datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    return jwt.encode({**data, "exp": exp, "type": "verification"}, SECRET, algorithm=ALGORITHM)

def create_reset_token(data: dict) -> str:
    exp = datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    return jwt.encode({**data, "exp": exp, "type": "reset"}, SECRET, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET, algorithms=[ALGORITHM])
    except JWTError:
        return None
