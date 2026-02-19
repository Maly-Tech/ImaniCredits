# api/user_profile.py
from flask import Blueprint, jsonify, session
from models import get_user_by_id  # DB helper functions

user_profile_bp = Blueprint('user_profile_bp', __name__)

@user_profile_bp.route('/user_profile')
def user_profile():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Not logged in"}), 401

    user = get_user_by_id(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "firstName": user.firstname,
        "lastName": user.lastname,
        "email": user.email,
        "phoneNumber": user.phonenumber,
    })