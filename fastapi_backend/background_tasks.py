import asyncio
import random
import uuid
from datetime import datetime, timezone
import logging
from database import AsyncSessionLocal
from models import NetworkEvent
from ws_manager import manager

logger = logging.getLogger("background_tasks")

PROTOCOLS = ["TCP", "UDP", "ICMP", "HTTP", "HTTPS"]
ACTIONS = ["Allowed", "Blocked", "Dropped"]

def generate_random_ip():
    return f"{random.randint(1, 255)}.{random.randint(0, 255)}.{random.randint(0, 255)}.{random.randint(0, 255)}"

def generate_random_geo():
    return {
        "lat": random.uniform(-60.0, 70.0),
        "lon": random.uniform(-180.0, 180.0)
    }

async def honeypot_listener():
    """Real-time network sensor that listens for actual connections on port 2222."""
    logger.info(">>> [SENSOR] Starting Real-Time Honeypot Sensor on port 2222...")
    logger.info("Starting Real-Time Honeypot Sensor on port 2222...")
    
    async def handle_intrusion(reader, writer):
        addr = writer.get_extra_info('peername')
        source_ip = addr[0]
        logger.info(f">>> [INTRUSION] REAL INTRUSION DETECTED: Connection from {source_ip}")
        
        # Create a real alert
        threat_alert = {
            "alert_type": "Intrusion Detected",
            "severity": "High",
            "details": {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "source_ip": source_ip,
                "destination_ip": "127.0.0.1",
                "port": 2222,
                "protocol": "TCP",
                "event_action": "Blocked",
                "source_geo": {
                    # For local testing, we'll randomize the origin so it shows on the globe
                    "lat": random.uniform(-60, 70),
                    "lon": random.uniform(-180, 180)
                }
            }
        }
        
        # Persist to DB
        try:
            async with AsyncSessionLocal() as session:
                new_event = NetworkEvent(
                    timestamp=datetime.now(timezone.utc),
                    source_ip=source_ip,
                    destination_ip="127.0.0.1",
                    port=2222,
                    protocol="TCP",
                    event_action="Blocked",
                    latitude=threat_alert["details"]["source_geo"]["lat"],
                    longitude=threat_alert["details"]["source_geo"]["lon"]
                )
                session.add(new_event)
                await session.commit()
                logger.info(f">>> [DATABASE] Event for {source_ip} saved successfully.")
        except Exception as e:
            logger.error(f">>> [DATABASE ERROR] Failed to save event for {source_ip}: {e}")
            
        # Broadcast live
        logger.info(f">>> [BROADCAST] Sending alert for {source_ip} via WebSocket...")
        await manager.broadcast(threat_alert)
        logger.info(f">>> [BROADCAST] Alert sent.")
        writer.close()
        await writer.wait_closed()

    try:
        server = await asyncio.start_server(handle_intrusion, '0.0.0.0', 2222)
        async with server:
            logger.info(">>> [SENSOR] Honeypot Server is live and listening on port 2222.")
            await server.serve_forever()
    except Exception as e:
        logger.critical(f">>> [CRITICAL] Honeypot Sensor failed to start: {e}", exc_info=True)

async def mock_network_log_generator():
    """Background task to generate 1 to 3 random network events every 5 seconds (reduced frequency)."""
    logger.info("Starting background traffic simulator...")
    while True:
        try:
            num_events = random.randint(1, 3)
            async with AsyncSessionLocal() as session:
                try:
                    for _ in range(num_events):
                        geo = generate_random_geo()
                        event_data = {
                            "timestamp": datetime.now(timezone.utc),
                            "source_ip": generate_random_ip(),
                            "destination_ip": generate_random_ip(),
                            "port": random.randint(1, 65535),
                            "protocol": random.choice(PROTOCOLS),
                            "event_action": random.choice(ACTIONS),
                            "latitude": geo["lat"],
                            "longitude": geo["lon"]
                        }
                        
                        new_event = NetworkEvent(
                            timestamp=event_data["timestamp"],
                            source_ip=event_data["source_ip"],
                            destination_ip=event_data["destination_ip"],
                            port=event_data["port"],
                            protocol=event_data["protocol"],
                            event_action=event_data["event_action"],
                            latitude=event_data["latitude"],
                            longitude=event_data["longitude"]
                        )
                        session.add(new_event)

                        # Threat evaluation logic
                        if event_data["event_action"] == "Blocked" or event_data["port"] == 22:
                            threat_alert = {
                                "alert_type": "Threat Detected",
                                "severity": "High" if event_data["port"] == 22 else "Medium",
                                "details": {
                                    **event_data,
                                    "timestamp": event_data["timestamp"].isoformat(),
                                    "source_geo": {
                                        "lat": event_data["latitude"],
                                        "lon": event_data["longitude"]
                                    }
                                }
                            }
                            asyncio.create_task(manager.broadcast(threat_alert))
                            
                    await session.commit()
                except Exception as e:
                    await session.rollback()
                    logger.error(f"Failed to insert events into Postgres: {e}")

            # Sleep for 5 seconds
            await asyncio.sleep(5)
        
        except asyncio.CancelledError:
            print("Mock network log generator cancelled.")
            break
        except Exception as e:
            logger.error(f"Unexpected error in background task: {e}")
            await asyncio.sleep(5) # backoff on unexpected error
