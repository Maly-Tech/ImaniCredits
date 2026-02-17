from flask import Flask, render_template, request, redirect, url_for, flash, session
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import db
from config import Config
from datetime import datetime
from functools import wraps
from models import User, LoanApplication  # Import your models
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
def calculate_risk(income, debt, credit_score, employment_years, loan_amount):
    """
    Calculates a risk score for a loan application and gives a recommendation.
    
    Inputs:
        income (float)          : monthly income of applicant
        debt (float)            : monthly debt obligations
        credit_score (int)      : 300-850 range
        employment_years (int)  : number of years employed
        loan_amount (float)     : requested loan amount
    
    Returns:
        risk_score (float)      : calculated risk score (0-100)
        recommendation (str)    : 'approved' or 'rejected'
    """

    score = 0

    # 1. Financial capacity: % of income available after debt
    if income > 0:
        available_ratio = max(income - debt, 0) / income  # 0-1
    else:
        available_ratio = 0
    score += available_ratio * 30  # max 30 points

    # 2. Credit score normalization
    score += (credit_score / 850) * 40  # max 40 points

    # 3. Employment years contribution (cap at 10 years)
    score += min(employment_years, 10) * 2  # max 20 points

    # 4. Loan amount vs income: bigger loan reduces score
    if income > 0:
        loan_ratio = loan_amount / income
    else:
        loan_ratio = 1
    score -= min(loan_ratio * 20, 20)  # max deduction 20 points

    # Ensure score is between 0 and 100
    risk_score = max(min(score, 100), 0)

    # Recommendation threshold
    recommendation = "approved" if risk_score >= 50 else "rejected"

    return round(risk_score, 2), recommendation


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

@app.route('/apply-loan', methods=['GET', 'POST'])
def apply_loan():
    if 'user_id' not in session:
        flash("Please login to apply for a loan", "danger")
        return redirect(url_for('login'))

    if request.method == 'POST':
        # KYC
        id_type = request.form.get('id_type')
        id_number = request.form.get('id_number')
        phone_number = request.form.get('phone_number')
        dob = request.form.get('dateOfBirth')

        # Personal
        first_name = request.form.get('firstName')
        last_name = request.form.get('lastName')
        email = request.form.get('email')
        marital_status = request.form.get('maritalStatus')
        street = request.form.get('streetAddress')
        city = request.form.get('city')
        county = request.form.get('state')
        postal_code = request.form.get('postalCode')

        # Employment
        employment_status = request.form.get('employmentStatus')
        occupation = request.form.get('occupation')
        company_name = request.form.get('companyName')
        industry = request.form.get('industry')
        years_in_job = request.form.get('yearsInJob')

        # Salary & Income
        annual_salary = float(request.form.get('annualSalary', 0))
        income_source = request.form.get('incomeSource')
        monthly_expenses = float(request.form.get('monthlyExpenses', 0))
        existing_debt = float(request.form.get('existingDebt', 0))
        bank_account_type = request.form.get('bankAccountType')

        # Loan
        loan_amount = float(request.form.get('loanSlider', 0))
        loan_purpose = request.form.get('loanPurpose')
        loan_term = request.form.get('loanTerm')

        # Terms checkbox
        terms = request.form.get('terms')
        if not terms:
            flash("You must agree to the terms and conditions", "danger")
            return redirect(url_for('apply_loan'))

        # Calculate risk
        risk_score, recommendation = calculate_risk(
            income=annual_salary,
            debt=existing_debt,
            credit_score=700,  # You might want to collect this too
            employment_years=int(years_in_job),
            loan_amount=loan_amount
        )

        # Save application
        application = LoanApplication(
            user_id=session['user_id'],
            income=annual_salary,
            debt=existing_debt,
            credit_score=700,
            employment_years=int(years_in_job),
            loan_amount=loan_amount,
            risk_score=risk_score,
            recommendation=recommendation,
            status=recommendation
        )

        db.session.add(application)
        db.session.commit()

        flash("Loan application submitted successfully!", "success")
        return redirect(url_for('my_applications'))

    return render_template('apply_loan.html')

@app.route('/my-applications')
@login_required
def my_applications():
    user_id = session.get('user_id')
    applications = LoanApplication.query.filter_by(user_id=user_id).order_by(LoanApplication.created_at.desc()).all()
    return render_template('my_applications.html', applications=applications)

# ====================
# RUN SERVER
# ====================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
