#import required libraries
from flask import Flask, render_template,request,redirect, url_for, flash,session, jsonify, make_response

#create flask app
app=Flask(__name__)

#route for homepage
@app.route('/')
def home():
    return render_template('index.html')
#route for login page
@app.route('/login')
def login():
    return render_template('login.html')
#route for regestration page
@app.route('/signup')
def signup():
    return render_template('signup.html')
#landing page after login
@app.route('/dashboard')
def dashboard():
    return render_template('landing.html')





if __name__=="__main__":
    app.run(host= "0.0.0.0", port= 5000, debug=True)

