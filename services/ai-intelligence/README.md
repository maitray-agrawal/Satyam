# AI Intelligence Service (Python FastAPI)

This microservice provides high-throughput statutory document parsing, Gemini multimodal field extraction, and citation-grounded evaluation summaries for the GEV-VERIFY platform.

## Endpoints
- `GET /health` - Service health and Gemini status
- `POST /api/v1/extract` - Extract structured domain fields from uploaded PDF / image bids
- `POST /api/v1/advisory` - Formulate structured, audit-grade advisory opinions strictly based on deterministic inputs

## Running Locally
```bash
pip install -r requirements.txt
python main.py
```
