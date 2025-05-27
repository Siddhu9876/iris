from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import os
from datetime import datetime
from dotenv import load_dotenv

# OpenAI imports (new SDK style)
from openai import OpenAI, OpenAIError, RateLimitError, AuthenticationError

load_dotenv()

app = Flask(__name__)
CORS(app)

# Correct: just the env var name, not the full key string!
openai_api_key = os.getenv("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")
client = OpenAI(api_key=openai_api_key)

SYSTEM_PROMPT = """
You are ChatGPT, a large language model trained by OpenAI. 
Respond conversationally and helpfully. Format responses with markdown when appropriate:
- Use **bold** for emphasis
- Use `code` for code snippets
- Use ``` for code blocks
- Use - or * for lists
- Use > for quotes
"""

conversations = {}

def get_conversation_id():
    return datetime.now().strftime("%Y%m%d%H%M%S%f")

def format_response(response_text):
    # Leave markdown code blocks intact
    if "```" in response_text:
        return response_text
    return response_text

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get('message')
        conversation_id = data.get('conversation_id')

        if not user_message:
            return jsonify({"error": "Message is required"}), 400

        if not conversation_id or conversation_id not in conversations:
            conversation_id = get_conversation_id()
            conversations[conversation_id] = [{"role": "system", "content": SYSTEM_PROMPT}]

        conversations[conversation_id].append({"role": "user", "content": user_message})

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=conversations[conversation_id],
            temperature=0.7,
            top_p=0.9,
            frequency_penalty=0.2,
            presence_penalty=0.2,
            max_tokens=1500
        )

        assistant_reply = response.choices[0].message.content
        formatted_reply = format_response(assistant_reply)

        conversations[conversation_id].append({"role": "assistant", "content": formatted_reply})

        return jsonify({
            "reply": formatted_reply,
            "conversation_id": conversation_id,
            "usage": {
                "prompt_tokens": response.usage.prompt_tokens,
                "completion_tokens": response.usage.completion_tokens,
                "total_tokens": response.usage.total_tokens
            }
        })

    except RateLimitError:
        return jsonify({"error": "Rate limit exceeded. Please try again later."}), 429
    except AuthenticationError:
        return jsonify({"error": "Invalid API key. Please check your configuration."}), 401
    except OpenAIError as e:
        return jsonify({"error": f"OpenAI API error: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/new_chat', methods=['POST'])
def new_chat():
    conversation_id = get_conversation_id()
    conversations[conversation_id] = [{"role": "system", "content": SYSTEM_PROMPT}]
    return jsonify({
        "conversation_id": conversation_id,
        "message": "New conversation started"
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
