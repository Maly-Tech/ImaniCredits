<<<<<<< HEAD
#to store secret keys
=======
import os

class Config:
    # Flask secret key (needed for forms and sessions)
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'simplesecretkey123'

    # MySQL database URI
    # Format: mysql+pymysql://username:password@host/databasename
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'mysql+pymysql://root:Mr.l0n3wolf1.@localhost/imanicredit'

    # Disable tracking modifications to save memory
    SQLALCHEMY_TRACK_MODIFICATIONS = False
>>>>>>> origin/feature/sammy
