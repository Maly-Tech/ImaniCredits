# ====================
# MODELS
# ====================
from extensions import db
from datetime import datetime
class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    firstname = db.Column(db.String(150), nullable=False)
    lastname = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    national_id = db.Column(db.String(20), unique=True, nullable=False)
    phonenumber = db.Column(db.String(20), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), default='user')  # future: admin, underwriter
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    applications = db.relationship(
        'LoanApplication',
        backref='user',
        lazy=True,
        cascade="all, delete-orphan"
    )

class LoanApplication(db.Model):
    __tablename__ = 'loan_application'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    income = db.Column(db.Float, nullable=False)
    debt = db.Column(db.Float, nullable=False)
    credit_score = db.Column(db.Integer, nullable=False)
    employment_years = db.Column(db.Integer, nullable=False)
    loan_amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(50), default='pending')
    risk_score = db.Column(db.Float)
    recommendation = db.Column(db.String(50))
    scoring_version = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    evaluated_at = db.Column(db.DateTime)
    risk_details = db.relationship(
        'LoanRiskDetails',
        backref='loan_application',
        uselist=False,
        cascade="all, delete-orphan"
    )

class LoanRiskDetails(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    application_id = db.Column(db.Integer, db.ForeignKey('loan_application.id'))
    breakdown = db.Column(db.JSON)
    ratios = db.Column(db.JSON)

     
def get_user_by_id(user_id):
    return User.query.get(user_id)
