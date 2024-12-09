# FastAPI Initialization
from fastapi import FastAPI
import uvicorn

# FastAPI App Initialization
app = FastAPI()

# FastAPI Root Endpoint
@app.get("/")
def read_root():
    return {"message": "Hello, World!"}

# FastAPI Run
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
