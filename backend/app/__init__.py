from flask import Flask
from config import Config
from flask_mail import Mail
from pymongo import MongoClient
from flask_cors import CORS

mail = Mail()
client = MongoClient("mongodb+srv://nilanjanchakraborty:WvlqTsVdUapYeSQu@cluster0.fjwixiy.mongodb.net?retryWrites=true&w=majority&appName=Cluster0")

db = client["test"]

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    mail.init_app(app)

    CORS(
        app,
        resources={r"/api/*": {"origins": "http://localhost:3000"}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    )
    
    from .routes import main
    from .adminRoutes import admin
    app.register_blueprint(main)
    app.register_blueprint(admin)

    return app
