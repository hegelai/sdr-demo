from flask import Flask, request, jsonify
import openai
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Replace with your GPT-4 model name, e.g., "gpt-4.0-turbo"
model = "gpt-4.0-turbo"

@app.route('/generate-email', methods=['POST'])
def generate_email():
    data = request.json
    prospect_data = data.get('prospectData')
    offer_description = data.get('offerDescription')

    if not prospect_data or not offer_description:
        return jsonify({"error": "Missing prospect data or offer description"}), 400

    try:
        email_content = call_openai_gpt4(prospect_data, offer_description)
        return jsonify({"email": email_content})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def call_openai_gpt4(prospect_data, offer_description):
    system_prompt = "Generate a professional email for sales outreach."
    user_prompt = f"Prospect Data: {prospect_data}. Offer Description: {offer_description}."

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]

    response = openai.chat.completions.create(
        model=model,
        messages=messages,
        temperature=0.7,
    )

    return response.choices[0].message['content']

if __name__ == '__main__':
    app.run(debug=True)
