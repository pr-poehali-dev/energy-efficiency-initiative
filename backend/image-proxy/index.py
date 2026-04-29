import urllib.request
import base64
import os


def handler(event: dict, context) -> dict:
    """Прокси для загрузки картинок с CDN и возврата в base64"""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": {"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type"}, "body": ""}

    params = event.get("queryStringParameters") or {}
    url = params.get("url", "")

    if not url:
        return {"statusCode": 400, "headers": {"Access-Control-Allow-Origin": "*"}, "body": "missing url"}

    # Разрешаем только наш CDN
    if not url.startswith("https://cdn.poehali.dev/"):
        return {"statusCode": 403, "headers": {"Access-Control-Allow-Origin": "*"}, "body": "forbidden"}

    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = resp.read()
        content_type = resp.headers.get("Content-Type", "image/png")

    b64 = base64.b64encode(data).decode("utf-8")
    data_url = f"data:{content_type};base64,{b64}"

    return {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
        },
        "body": f'{{"dataUrl":"{data_url}"}}',
    }
