from jose import JWTError, jwt 
from datetime import datetime, timedelta
from app.core.config import settings

def create_access_token(data:dict, expires : timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires or timedelta(minutes=settings.access_token_expire))
    to_encode.update(
        {
            "exp" : expire 
        }
    )
    return to_encode 

def verify_token(token : str ):
    try : 
        payload = jwt.decode(
            token,
            settings.key,
            algorithms=['HS256']
        )
        user_id : str = payload.get('sub')
        if user_id is None :
            return None 
        return {
            "user_id" : user_id
        }
    except JWTError:
        return None