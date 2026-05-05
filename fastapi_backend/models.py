import uuid
import enum
from sqlalchemy import Column, String, Text, Enum, ForeignKey, JSON, DateTime, Float, Integer, UUID
from sqlalchemy.orm import relationship
from database import Base

class RoleEnum(str, enum.Enum):
    admin = "admin"
    analyst = "analyst"

class SeverityEnum(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"

class StatusEnum(str, enum.Enum):
    open = "open"
    investigating = "investigating"
    resolved = "resolved"

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(RoleEnum, name="role_enum"), nullable=False)

    incidents = relationship("Incident", back_populates="assignee", cascade="all, delete-orphan")

class AlertRule(Base):
    __tablename__ = "alert_rules"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    condition_logic = Column(JSON, nullable=False)
    severity = Column(Enum(SeverityEnum, name="severity_enum"), nullable=False)

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    status = Column(Enum(StatusEnum, name="status_enum"), nullable=False, default=StatusEnum.open)
    assigned_to = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    notes = Column(Text, nullable=True)

    assignee = relationship("User", back_populates="incidents")

class NetworkEvent(Base):
    __tablename__ = "network_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    timestamp = Column(DateTime(timezone=True), index=True, nullable=False)
    source_ip = Column(String, nullable=False)
    destination_ip = Column(String, nullable=False)
    port = Column(Integer, nullable=False)
    protocol = Column(String, nullable=False)
    event_action = Column(String, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
