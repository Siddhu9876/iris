from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import os
from datetime import datetime
from dotenv import load_dotenv
from openai import OpenAI, OpenAIError, RateLimitError, AuthenticationError

load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize OpenAI client with API key from environment
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

SYSTEM_PROMPT = """
You are Iris, a helpful and knowledgeable AI assistant. 
Format your responses using markdown when appropriate:
- Use **bold** for emphasis
- Use `code` for code snippets
- Use ``` for code blocks
- Use - or * for lists
- Use > for quotes

Keep responses clear, helpful, and well-structured.
"""

conversations = {}

def get_conversation_id():
    return datetime.now().strftime("%Y%m%d%H%M%S%f")

def format_response(response_text):
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