from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from datetime import datetime, date
import models, schemas, database
from database import engine
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/sensor-data/", response_model=schemas.SensorData)
def post_sensor_data(data: schemas.SensorDataCreate, db: Session = Depends(database.get_db)):
    db_data = models.SensorData(**data.dict())
    db.add(db_data)
    db.commit()
    db.refresh(db_data)
    return db_data

@app.get("/sensor-data/latest/", response_model=schemas.SensorData)
def get_latest_sensor_data(db: Session = Depends(database.get_db)):
    """Get the most recent sensor reading"""
    latest_data = db.query(models.SensorData).order_by(desc(models.SensorData.id)).first()
    if not latest_data:
        raise HTTPException(status_code=404, detail="No sensor data found")
    return latest_data

@app.get("/sensor-data/by-date/", response_model=List[schemas.SensorData])
def get_sensor_data_by_date(
    date: date,
    db: Session = Depends(database.get_db)
):
    """Get sensor data for a specific date"""
    start_datetime = datetime.combine(date, datetime.min.time())
    end_datetime = datetime.combine(date, datetime.max.time())
    
    data = db.query(models.SensorData)\
        .filter(models.SensorData.timestamp >= start_datetime)\
        .filter(models.SensorData.timestamp <= end_datetime)\
        .order_by(desc(models.SensorData.timestamp))\
        .all()
    return data

@app.get("/sensor-data/time-range/", response_model=List[schemas.SensorData])
def get_sensor_data_by_time_range(
    start_time: datetime,
    end_time: datetime,
    db: Session = Depends(database.get_db)
):
    """Get sensor data between two timestamps"""
    data = db.query(models.SensorData)\
        .filter(models.SensorData.timestamp >= start_time)\
        .filter(models.SensorData.timestamp <= end_time)\
        .order_by(desc(models.SensorData.timestamp))\
        .all()
    return data

@app.get("/sensor-data/last-n-minutes/", response_model=List[schemas.SensorData])
def get_sensor_data_last_n_minutes(
    minutes: int,
    db: Session = Depends(database.get_db)
):
    """Get sensor data from the last N minutes"""
    current_time = datetime.now()
    time_threshold = current_time - datetime.timedelta(minutes=minutes)
    
    data = db.query(models.SensorData)\
        .filter(models.SensorData.timestamp >= time_threshold)\
        .order_by(desc(models.SensorData.timestamp))\
        .all()
    return data

# Modified original endpoint to include ordering and optional time filtering
@app.get("/sensor-data/", response_model=List[schemas.SensorData])
def get_sensor_data(
    skip: int = 0, 
    limit: int = 100,
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    db: Session = Depends(database.get_db)
):
    """Get sensor data with pagination and optional time filtering"""
    query = db.query(models.SensorData)
    
    if start_time:
        query = query.filter(models.SensorData.timestamp >= start_time)
    if end_time:
        query = query.filter(models.SensorData.timestamp <= end_time)
    
    sensor_data = query\
        .order_by(desc(models.SensorData.timestamp))\
        .offset(skip)\
        .limit(limit)\
        .all()
    return sensor_data

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
