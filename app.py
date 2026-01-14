from flask import Flask, render_template

app = Flask(__name__)

# --- Routes ---
@app.route('/')
def dashboard():
    return render_template('dashboard.html', page="dashboard")

@app.route('/utilities')
def utilities():
    return render_template('utilities.html', page="utilities")

@app.route('/insights')
def insights():
    return render_template('insights.html', page="insights")

@app.route('/simulator')
def simulator():
    return render_template('simulator.html', page="simulator")

@app.route('/services')
def services():
    return render_template('services.html', page="services")

@app.route('/community')
def community():
    return render_template('community.html', page="community")

@app.route('/records')
def records():
    return render_template('records.html', page="records")

@app.route('/profile')
def profile():
    return render_template('profile.html', page="profile")

if __name__ == '__main__':
    app.run(debug=True)
