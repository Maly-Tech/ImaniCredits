from flask import Flask, render_template, request, redirect, url_for, flash, session
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from config import Config

# Create Flask app and load config
app = Flask(__name__)
app.config.from_object(Config)

# Initialize database
db = SQLAlchemy(app)

# ====================
# MODELS
# ====================

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    firstname = db.Column(db.String(150), nullable=False)
    lastname = db.Column(db.String(150), nullable=False)
    national_id = db.Column(db.String(20), nullable=False, unique=True)
    phonenumber = db.Column(db.String(20), nullable=False)
    password = db.Column(db.String(200), nullable=False)


class LoanApplication(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    income = db.Column(db.Float, nullable=False)
    debt = db.Column(db.Float, nullable=False)
    credit_score = db.Column(db.Integer, nullable=False)
    employment_years = db.Column(db.Integer, nullable=False)
    loan_amount = db.Column(db.Float, nullable=False)
    risk_score = db.Column(db.Float)
    recommendation = db.Column(db.String(50))

# ====================
# ROUTES
# ====================

# Homepage
@app.route('/')
def home():
    return render_template('landing.html')

# Signup route (GET + POST)

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        # Get form data
        firstname = request.form.get('firstname')
        lastname = request.form.get('lastname')
        national_id = request.form.get('NationalID')
        phonenumber = request.form.get('phonenumber')
        password = request.form.get('password')
        confirm_password = request.form.get('confirmPassword')
        agree = request.form.get('agree')

        # Validate terms checkbox
        if not agree:
            flash('You must agree to the terms and conditions', 'danger')
            return redirect(url_for('signup'))

        # Validate password match
        if password != confirm_password:
            flash('Passwords do not match', 'danger')
            return redirect(url_for('signup'))

        # Check if NationalID already exists
        existing_user = User.query.filter_by(national_id=national_id).first()
        if existing_user:
            flash('National ID already registered', 'danger')
            return redirect(url_for('signup'))

        # Hash the password
        hashed_password = generate_password_hash(password, method='pbkdf2:sha256')

        # Create new user
        new_user = User(
            firstname=firstname,
            lastname=lastname,
            national_id=national_id,
            phonenumber=phonenumber,
            password=hashed_password
        )
        db.session.add(new_user)
        db.session.commit()

        flash('Account created successfully! Please login.', 'success')
        return redirect(url_for('login'))

    # GET request
    return render_template('signup.html')
#landing page after login

# Login page
from werkzeug.security import check_password_hash

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        # Get form data
        national_id = request.form.get('national_id')
        password = request.form.get('password')

        # Find user by National ID
        user = User.query.filter_by(national_id=national_id).first()
        if not user:
            flash('National ID not found', 'danger')
            return redirect(url_for('login'))

        # Check password
        if not check_password_hash(user.password, password):
            flash('Incorrect password', 'danger')
            return redirect(url_for('login'))

        # Successful login: store info in session
        session['user_id'] = user.id
        session['firstname'] = user.firstname
        flash(f'Welcome, {user.firstname}!', 'success')
        return redirect(url_for('dashboard'))

    return render_template('login.html')


# Dashboard
@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')



# Logout route
@app.route('/logout')
def logout():
    session.clear()
    flash('You have been logged out.', 'info')
    return redirect(url_for('home'))

# ====================
# RUN SERVER
# ====================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
