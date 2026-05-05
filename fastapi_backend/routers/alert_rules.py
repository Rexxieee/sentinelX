from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

import crud, schemas
from database import get_db
from auth import get_current_user
from models import User

router = APIRouter(prefix="/api/v1/alert-rules", tags=["Alert Rules"])

@router.post("/", response_model=schemas.AlertRuleResponse, status_code=status.HTTP_201_CREATED)
async def create_alert_rule(rule: schemas.AlertRuleCreate, db: AsyncSession = Depends(get_db)):
    return await crud.create_alert_rule(db=db, rule=rule)

@router.get("/", response_model=List[schemas.AlertRuleResponse])
async def read_alert_rules(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    rules = await crud.get_alert_rules(db, skip=skip, limit=limit)
    return rules

@router.get("/{rule_id}", response_model=schemas.AlertRuleResponse)
async def read_alert_rule(rule_id: UUID, db: AsyncSession = Depends(get_db)):
    db_rule = await crud.get_alert_rule(db, rule_id=rule_id)
    if db_rule is None:
        raise HTTPException(status_code=404, detail="Alert Rule not found")
    return db_rule

@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
async def delete_all_alert_rules(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    await crud.delete_all_alert_rules(db)
    return None

@router.delete("/{rule_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_alert_rule(rule_id: UUID, db: AsyncSession = Depends(get_db)):
    db_rule = await crud.delete_alert_rule(db, rule_id=rule_id)
    if db_rule is None:
        raise HTTPException(status_code=404, detail="Alert Rule not found")
    return None
