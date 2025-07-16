from app import create_app
from flask_socketio import SocketIO

app = create_app()
socketio = SocketIO(app)

@app.context_processor
def inject_navbar():
    navbar_items = ['Home', 'Products', 'Services', 'Contact']
    return dict(navbar_items=navbar_items)

if __name__ == "__main__":
    socketio.run(app, debug=True)
