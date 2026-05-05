from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

import crud, schemas
from database import get_db
from auth import get_current_user
from models import User

router = APIRouter(prefix="/api/v1/incidents", tags=["Incidents"])

@router.post("/", response_model=schemas.IncidentResponse, status_code=status.HTTP_201_CREATED)
async def create_incident(incident: schemas.IncidentCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Validate assigned user exists if provided
    if incident.assigned_to:
        user = await crud.get_user(db, user_id=incident.assigned_to)
        if not user:
            raise HTTPException(status_code=400, detail="Assigned user not found")
    else:
        # Auto-assign to current user if not specified
        incident.assigned_to = current_user.id
        
    return await crud.create_incident(db=db, incident=incident)

@router.get("/", response_model=List[schemas.IncidentResponse])
async def read_incidents(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    incidents = await crud.get_incidents(db, skip=skip, limit=limit)
    return incidents

@router.get("/{incident_id}", response_model=schemas.IncidentResponse)
async def read_incident(incident_id: UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_incident = await crud.get_incident(db, incident_id=incident_id)
    if db_incident is None:
        raise HTTPException(status_code=404, detail="Incident not found")
    return db_incident

@router.patch("/{incident_id}", response_model=schemas.IncidentResponse)
async def patch_incident(incident_id: UUID, incident_update: schemas.IncidentUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_incident = await crud.get_incident(db, incident_id=incident_id)
    if db_incident is None:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    if incident_update.assigned_to:
        user = await crud.get_user(db, user_id=incident_update.assigned_to)
        if not user:
            raise HTTPException(status_code=400, detail="Assigned user not found")
            
    updated_incident = await crud.update_incident(db, incident_id, incident_update)
    return updated_incident

@router.delete("/reset", status_code=status.HTTP_204_NO_CONTENT)
async def reset_system_data(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Danger Zone: Clears all incidents and network events."""
    await crud.delete_all_incidents(db)
    await crud.delete_all_events(db)
    return None

@router.delete("/{incident_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_incident(incident_id: UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_incident = await crud.delete_incident(db, incident_id=incident_id)
    if db_incident is None:
        raise HTTPException(status_code=404, detail="Incident not found")
    return None
