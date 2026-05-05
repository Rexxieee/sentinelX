from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
import models, schemas

from auth import get_password_hash

# --- User CRUD ---
async def get_user(db: AsyncSession, user_id: UUID):
    result = await db.execute(select(models.User).filter(models.User.id == user_id))
    return result.scalar_one_or_none()

async def get_user_by_email(db: AsyncSession, email: str):
    result = await db.execute(select(models.User).filter(models.User.email == email))
    return result.scalar_one_or_none()

async def get_users(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(select(models.User).offset(skip).limit(limit))
    return result.scalars().all()

async def create_user(db: AsyncSession, user: schemas.UserCreate):
    db_user = models.User(
        username=user.username,
        email=user.email,
        password_hash=get_password_hash(user.password),
        role=user.role
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

# --- AlertRule CRUD ---
async def get_alert_rule(db: AsyncSession, rule_id: UUID):
    result = await db.execute(select(models.AlertRule).filter(models.AlertRule.id == rule_id))
    return result.scalar_one_or_none()

async def get_alert_rules(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(select(models.AlertRule).offset(skip).limit(limit))
    return result.scalars().all()

async def create_alert_rule(db: AsyncSession, rule: schemas.AlertRuleCreate):
    db_rule = models.AlertRule(**rule.model_dump())
    db.add(db_rule)
    await db.commit()
    await db.refresh(db_rule)
    return db_rule

# --- Incident CRUD ---
async def get_incident(db: AsyncSession, incident_id: UUID):
    result = await db.execute(select(models.Incident).filter(models.Incident.id == incident_id))
    return result.scalar_one_or_none()

async def get_incidents(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(select(models.Incident).offset(skip).limit(limit))
    return result.scalars().all()

async def create_incident(db: AsyncSession, incident: schemas.IncidentCreate):
    db_incident = models.Incident(**incident.model_dump())
    db.add(db_incident)
    await db.commit()
    await db.refresh(db_incident)
    return db_incident

async def update_incident(db: AsyncSession, incident_id: UUID, incident_update: schemas.IncidentUpdate):
    db_incident = await get_incident(db, incident_id)
    if db_incident:
        update_data = incident_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_incident, key, value)
        await db.commit()
        await db.refresh(db_incident)
    return db_incident

async def delete_alert_rule(db: AsyncSession, rule_id: UUID):
    db_rule = await get_alert_rule(db, rule_id)
    if db_rule:
        await db.delete(db_rule)
        await db.commit()
    return db_rule

async def delete_incident(db: AsyncSession, incident_id: UUID):
    db_incident = await get_incident(db, incident_id)
    if db_incident:
        await db.delete(db_incident)
        await db.commit()
    return db_incident

async def delete_all_alert_rules(db: AsyncSession):
    from sqlalchemy import delete
    await db.execute(delete(models.AlertRule))
    await db.commit()
    return True

async def delete_all_incidents(db: AsyncSession):
    from sqlalchemy import delete
    await db.execute(delete(models.Incident))
    await db.commit()
    return True

async def delete_all_events(db: AsyncSession):
    from sqlalchemy import delete
    await db.execute(delete(models.NetworkEvent))
    await db.commit()
    return True
