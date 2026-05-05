from pydantic import BaseModel, ConfigDict, EmailStr
from typing import Optional, Any, Dict
from uuid import UUID
from models import RoleEnum, SeverityEnum, StatusEnum

# --- User Schemas ---
class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: RoleEnum

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: UUID
    
    # Enables Pydantic to read data from SQLAlchemy ORM objects
    model_config = ConfigDict(from_attributes=True)

# --- AlertRule Schemas ---
class AlertRuleBase(BaseModel):
    name: str
    condition_logic: Dict[str, Any]
    severity: SeverityEnum

class AlertRuleCreate(AlertRuleBase):
    pass

class AlertRuleResponse(AlertRuleBase):
    id: UUID

    model_config = ConfigDict(from_attributes=True)

# --- Incident Schemas ---
class IncidentBase(BaseModel):
    status: StatusEnum = StatusEnum.open
    assigned_to: Optional[UUID] = None
    notes: Optional[str] = None

class IncidentCreate(IncidentBase):
    pass

class IncidentUpdate(BaseModel):
    status: Optional[StatusEnum] = None
    assigned_to: Optional[UUID] = None
    notes: Optional[str] = None

class IncidentResponse(IncidentBase):
    id: UUID

    model_config = ConfigDict(from_attributes=True)
