from sqlalchemy import Column, Integer, Float, DateTime
from database import Base
import datetime

class SensorData(Base):
    __tablename__ = "sensor_data"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.now)
    
    # DHT11 data
    temperature = Column(Float)
    humidity = Column(Float)
    
    # MPU6050 data
    accel_x = Column(Float)
    accel_y = Column(Float)
    accel_z = Column(Float)
    gyro_x = Column(Float)
    gyro_y = Column(Float)
    gyro_z = Column(Float)
    
    # BMP280 data
    bmp_temperature = Column(Float)
    pressure = Column(Float)
    altitude = Column(Float)
