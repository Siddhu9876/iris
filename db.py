import psycopg2
import os

def save_message(user, bot):
    conn = psycopg2.connect(
        dbname="your_db",
        user="your_user",
        password="your_password",
        host="localhost"
    )
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO chat_history (user_message, bot_reply) VALUES (%s, %s);",
        (user, bot)
    )
    conn.commit()
    cur.close()
    conn.close()
