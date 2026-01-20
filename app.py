from flask import Flask, render_template, session, request, jsonify
from googletrans import Translator
import os

app = Flask(__name__)
app.secret_key = 'your-secret-key-here-change-in-production'

# Initialize Google Translator
translator = Translator()

# Cache for translations to reduce API calls
translation_cache = {}

# Language helper function using Google Translate API
def get_text(key):
    lang = session.get('language', 'en')
    
    # If English, return original text
    if lang == 'en':
        return key
    
    # Check cache first
    cache_key = f"{lang}:{key}"
    if cache_key in translation_cache:
        return translation_cache[cache_key]
    
    # Translate using Google Translate API
    try:
        translation = translator.translate(key, dest=lang, src='en')
        translated_text = translation.text
        # Cache the translation
        translation_cache[cache_key] = translated_text
        return translated_text
    except Exception as e:
        print(f"Translation error: {e}")
        return key  # Return original text if translation fails

# Make get_text available in all templates
@app.context_processor
def inject_translation():
    return dict(t=get_text, current_lang=session.get('language', 'en'))

# Route to change language
@app.route('/set_language/<lang>')
def set_language(lang):
    # Support all major Indian languages
    supported_languages = ['en', 'hi', 'bn', 'ta', 'te', 'kn', 'pa', 'gu', 'ml', 'mr', 'or']
    if lang in supported_languages:
        session['language'] = lang
        return jsonify({'status': 'success', 'language': lang})
    return jsonify({'status': 'error', 'message': 'Invalid language'}), 400

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
