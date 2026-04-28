import json
import os
import psycopg2


def handler(event: dict, context) -> dict:
    """Проверка лицензионного ключа клиента"""
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400',
            },
            'body': ''
        }

    if event.get('httpMethod') != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }

    body = json.loads(event.get('body') or '{}')
    key = (body.get('key') or '').strip()

    if not key:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'valid': False, 'error': 'Ключ не указан'})
        }

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    cur.execute(
        "SELECT client_name, expires_at FROM license_keys WHERE key = %s AND is_active = TRUE AND (expires_at IS NULL OR expires_at > NOW())",
        (key,)
    )
    row = cur.fetchone()
    cur.close()
    conn.close()

    if row:
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'valid': True, 'client_name': row[0]})
        }
    else:
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'valid': False, 'error': 'Ключ не найден или недействителен'})
        }
