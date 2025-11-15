FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY fraud_detection/ ./fraud_detection/

EXPOSE 5000

CMD ["uvicorn", "fraud_detection.api:app", "--host", "0.0.0.0", "--port", "5000"]

