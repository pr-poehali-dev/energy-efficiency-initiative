CREATE TABLE license_keys (
  id SERIAL PRIMARY KEY,
  key VARCHAR(64) NOT NULL UNIQUE,
  client_name VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

INSERT INTO license_keys (key, client_name) VALUES ('DEMO-UNLOCK-2024', 'Тестовый клиент');