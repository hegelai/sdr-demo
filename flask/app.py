from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
import prompttools.logger
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*", "allow_headers": ["Content-Type", "Authorization"]}})

model = "gpt-3.5-turbo"

@app.route('/feedback', methods=['POST'])
def feedback():
    data = request.json
    log_id = data.get('log_id')
    user_feedback = data.get('feedback')

    if not log_id or not user_feedback:
        return jsonify({"error": "Missing log ID or feedback"}), 400

    prompttools.logger.add_feedback(log_id, 'user_feedback', user_feedback)

    return jsonify({"message": "Feedback received"}), 200

@app.route('/generate-email', methods=['POST'])
def generate_email():
    data = request.json
    prospect_data = data.get('prospectData')
    offer_description = data.get('offerDescription')

    if not prospect_data or not offer_description:
        return jsonify({"error": "Missing prospect data or offer description"}), 400

    try:
        email_content, log_id = call_openai_gpt4(prospect_data, offer_description)
        return jsonify({"email": email_content, "log_id": log_id})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def call_openai_gpt4(prospect_data, offer_description):
    system_prompt = "Generate a professional email for sales outreach."
    user_prompt = f"Prospect Data: {prospect_data}. Offer Description: {offer_description}."

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]

    completion = openai.chat.completions.create(
        model=model,
        messages=messages,
    )

    return completion.choices[0].message.content, completion.log_id

if __name__ == '__main__':
    app.run(debug=True)
