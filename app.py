from flask import Flask, render_template, request, redirect, url_for, flash, session
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import db
from config import Config
from datetime import datetime
from functools import wraps
from models import User, LoanApplication, LoanRiskDetails  # Import your models
from api.user_profile import user_profile_bp  # Import the user profile route

# ====================
# APP SETUP
# ====================
app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)
app.register_blueprint(user_profile_bp, url_prefix='/api')


# ====================
# RISK CALCULATION
# ====================
# ====================
# RISK CALCULATION
# ====================
def calculate_risk(income, debt, credit_score, employment_years, loan_amount):
    """
    Weighted Multi-Criteria Risk Model with explainability.
    Returns:
        risk_score (float), recommendation (str), breakdown (dict), ratios (dict)
    """
    if income <= 0:
        raise ValueError("Income must be greater than zero")

    # ---- Derived Ratios ----
    dti = debt / income
    loan_income_ratio = loan_amount / income

    # ---- Normalization (0–1 scale) ----
    credit_norm = max(0, min((credit_score - 300) / (850 - 300), 1))
    employment_norm = max(0, min(employment_years / 10, 1))
    dti_norm = max(0, min(1 - dti, 1))
    loan_ratio_norm = max(0, min(1 - loan_income_ratio, 1))

    # ---- Weighted Score ----
    weights = {
        "credit": 0.35,
        "dti": 0.30,
        "loan_ratio": 0.20,
        "employment": 0.15
    }

    credit_component = weights["credit"] * credit_norm
    dti_component = weights["dti"] * dti_norm
    loan_component = weights["loan_ratio"] * loan_ratio_norm
    employment_component = weights["employment"] * employment_norm

    total_score = (credit_component + dti_component + loan_component + employment_component) * 100

    # ---- Recommendation ----
    if total_score >= 75:
        recommendation = "Approve"
    elif total_score >= 60:
        recommendation = "Review"
    else:
        recommendation = "Reject"

    breakdown = {
        "credit_score_contribution": round(credit_component * 100, 2),
        "dti_contribution": round(dti_component * 100, 2),
        "loan_burden_contribution": round(loan_component * 100, 2),
        "employment_contribution": round(employment_component * 100, 2),
    }

    ratios = {
        "debt_to_income": round(dti, 2),
        "loan_to_income": round(loan_income_ratio, 2)
    }

    return round(total_score, 2), recommendation, breakdown, ratios




# ====================
# LOGIN REQUIRED DECORATOR
# ====================
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash("Please login first.", "danger")
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

# ====================
# ROUTES
# ====================
@app.route('/')
def home():
    return render_template('landing.html')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        firstname = request.form.get('firstname')
        lastname = request.form.get('lastname')
        national_id = request.form.get('NationalID')
        phonenumber = request.form.get('phonenumber')
        email = request.form.get('email')
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

        # Check if NationalID exists
        if User.query.filter_by(national_id=national_id).first():
            flash('National ID already registered', 'danger')
            return redirect(url_for('signup'))

        # Hash password and save user
        hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
        new_user = User(
            firstname=firstname,
            lastname=lastname,
            national_id=national_id,
            phonenumber=phonenumber,
            email=email,
            password_hash=hashed_password
        )
        db.session.add(new_user)
        db.session.commit()

        flash('Account created successfully! Please login.', 'success')
        return redirect(url_for('login'))

    return render_template('signup.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        national_id = request.form.get('national_id')
        password = request.form.get('password')

        user = User.query.filter_by(national_id=national_id).first()
        if not user:
            flash('National ID not found', 'danger')
            return redirect(url_for('login'))

        if not check_password_hash(user.password_hash, password):
            flash('Incorrect password', 'danger')
            return redirect(url_for('login'))

        # Login success
        session['user_id'] = user.id
        session['firstname'] = user.firstname
        flash(f'Welcome, {user.firstname}!', 'success')
        return redirect(url_for('dashboard'))

    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    flash('You have been logged out.', 'info')
    return redirect(url_for('home'))

@app.route('/dashboard')
def dashboard():
    return render_template('landing.html')

@app.route('/faq')
def faq():
    return render_template('FAQs.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')  
@app.route('/about')
def about():
    return render_template('about.html')   

@app.route('/apply-loan', methods=['GET', 'POST'])
@login_required
def apply_loan():
    if request.method == 'POST':
        # ---------------------------
        # Collect form data
        # ---------------------------
        annual_salary = float(request.form.get('annualSalary', 0))
        existing_debt = float(request.form.get('existingDebt', 0))
        years_in_job = int(request.form.get('yearsInJob', 0))
        loan_amount = float(request.form.get('loanSlider', 0))
        credit_score = 700  # Placeholder; can later fetch from external API

        # Terms validation
        terms = request.form.get('terms')
        if not terms:
            flash("You must agree to the terms and conditions", "danger")
            return redirect(url_for('apply_loan'))

        # ---------------------------
        # Calculate risk
        # ---------------------------
        risk_score, recommendation, breakdown, ratios = calculate_risk(
            income=annual_salary,
            debt=existing_debt,
            credit_score=credit_score,
            employment_years=years_in_job,
            loan_amount=loan_amount
        )

        # ---------------------------
        # Save Loan Application
        # ---------------------------
        application = LoanApplication(
            user_id=session['user_id'],
            income=annual_salary,
            debt=existing_debt,
            credit_score=credit_score,
            employment_years=years_in_job,
            loan_amount=loan_amount,
            risk_score=risk_score,
            recommendation=recommendation,
            status=recommendation
        )
        db.session.add(application)
        db.session.commit()  # Must commit first to get application.id

        # ---------------------------
        # Save Risk Explainability
        # ---------------------------
        risk_details = LoanRiskDetails(
            application_id=application.id,
            breakdown=breakdown,
            ratios=ratios
        )
        db.session.add(risk_details)
        db.session.commit()

        flash("Loan application submitted successfully!", "success")
        return redirect(url_for('my_applications'))

    return render_template('apply_loan.html')



@app.route('/my-applications')
@login_required
def my_applications():
    user_id = session.get('user_id')
    applications = LoanApplication.query\
        .filter_by(user_id=user_id)\
        .order_by(LoanApplication.created_at.desc())\
        .all()

    return render_template('my_applications.html', applications=applications)


# ====================
# RUN SERVER
# ====================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
