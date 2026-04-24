from cryptography.fernet import Fernet
from app.core.config import settings

def get_fernet():
    return Fernet(settings.ENCRYPTION_KEY.encode())

def encrypt_data(data: str) -> str:
    if not data:
        return ""
    f = get_fernet()
    return f.encrypt(data.encode()).decode()

def decrypt_data(encrypted_data: str) -> str:
    if not encrypted_data:
        return ""
    f = get_fernet()
    try:
        return f.decrypt(encrypted_data.encode()).decode()
    except Exception:
        # If decryption fails, return the original data (useful for transition)
        return encrypted_data
