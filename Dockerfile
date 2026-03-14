# stage 1
FROM python:3.11 AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y gcc libpq-dev && rm -rf /var/lib/apt/lists/*

RUN python -m venv /opt/venv

ENV PATH='/opt/venv/bin:$PATH'

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt


# stage 2
FROM python:3.11

WORKDIR /app

RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

COPY --from=builder /opt/venv /opt/venv

ENV PATH='/opt/venv/bin:$PATH'

COPY . .

HEALTHCHECK  --interval=30s --timeout=3s --start-period=5s --retries=3 CMD python -c "import requests; requests.get('http://localhost:8000/health')"

EXPOSE 8000

CMD ["gunicorn", "app.main:app", "--workers", "4", "--worker-class", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]