
import os

class Config:
    SECRET_KEY = 'secret!'
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = 'nilanjan.chakraborty@codeclouds.in'
    MAIL_PASSWORD = 'ykmzonytmyhxoyyg'  # Use app password if using Gmail
    MAIL_DEFAULT_SENDER = 'no-reply@gmail.com'

    UPLOAD_FOLDER = 'uploads'
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf'}
    MAX_FILE_SIZE_MB = 2

    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

