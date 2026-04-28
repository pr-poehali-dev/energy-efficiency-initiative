import json
import os
import psycopg2


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Password',
}


def check_auth(event: dict) -> bool:
    """Проверяет пароль администратора из заголовка"""
    password = (event.get('headers') or {}).get('x-admin-password', '')
    return password == os.environ.get('ADMIN_PASSWORD', '')


def handler(event: dict, context) -> dict:
    """Управление лицензионными ключами: список, добавление, удаление"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    if not check_auth(event):
        return {
            'statusCode': 401,
            'headers': {**CORS, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Неверный пароль'})
        }

    method = event.get('httpMethod', 'GET')

    if method == 'GET':
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            "SELECT id, key, client_name, is_active, created_at, expires_at FROM license_keys ORDER BY created_at DESC"
        )
        rows = cur.fetchall()
        cur.close()
        conn.close()
        keys = [
            {
                'id': r[0],
                'key': r[1],
                'client_name': r[2],
                'is_active': r[3],
                'created_at': r[4].isoformat() if r[4] else None,
                'expires_at': r[5].isoformat() if r[5] else None,
            }
            for r in rows
        ]
        return {
            'statusCode': 200,
            'headers': {**CORS, 'Content-Type': 'application/json'},
            'body': json.dumps({'keys': keys})
        }

    if method == 'POST':
        body = json.loads(event.get('body') or '{}')
        key = (body.get('key') or '').strip()
        client_name = (body.get('client_name') or '').strip()
        expires_at = body.get('expires_at') or None

        if not key or not client_name:
            return {
                'statusCode': 400,
                'headers': {**CORS, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Ключ и имя клиента обязательны'})
            }

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO license_keys (key, client_name, expires_at) VALUES (%s, %s, %s) RETURNING id",
            (key, client_name, expires_at)
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        return {
            'statusCode': 200,
            'headers': {**CORS, 'Content-Type': 'application/json'},
            'body': json.dumps({'success': True, 'id': new_id})
        }

    if method == 'DELETE':
        body = json.loads(event.get('body') or '{}')
        key_id = body.get('id')
        if not key_id:
            return {
                'statusCode': 400,
                'headers': {**CORS, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'ID ключа обязателен'})
            }
        conn = get_conn()
        cur = conn.cursor()
        cur.execute("DELETE FROM license_keys WHERE id = %s", (key_id,))
        conn.commit()
        cur.close()
        conn.close()
        return {
            'statusCode': 200,
            'headers': {**CORS, 'Content-Type': 'application/json'},
            'body': json.dumps({'success': True})
        }

    return {
        'statusCode': 405,
        'headers': {**CORS, 'Content-Type': 'application/json'},
        'body': json.dumps({'error': 'Method not allowed'})
    }
