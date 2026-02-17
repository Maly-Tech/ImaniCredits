# api/user_profile.py
from flask import Blueprint, jsonify, session
from models import get_user_by_id  # DB helper functions

user_profile_bp = Blueprint('user_profile_bp', __name__)

@user_profile_bp.route('/user-profile')
def user_profile():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Not logged in"}), 401

    user = get_user_by_id(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "firstName": user['first_name'],
        "lastName": user['last_name'],
        "email": user['email'],
        "phoneNumber": user['phone_number']
    })
