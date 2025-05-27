CREATE TABLE chat_history (
    id SERIAL PRIMARY KEY,
    user_message TEXT,
    bot_reply TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
