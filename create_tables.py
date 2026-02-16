# create_tables.py

from app import app, db

# Use Flask application context
with app.app_context():
    db.create_all()  # This creates all tables from your models
    print("Tables created successfully in MySQL!")
