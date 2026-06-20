from typing import List, Dict
from fastapi import WebSocket
import json

class ConnectionManager:
    def __init__(self):
        # Store active connections
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        await websocket.send_text(json.dumps(message))

    async def broadcast(self, message: dict):
        # Create a copy of list to prevent modification issues during async iteration
        connections = list(self.active_connections)
        for connection in connections:
            try:
                await connection.send_text(json.dumps(message))
            except Exception:
                # Remove stale or broken connections immediately
                self.disconnect(connection)

manager = ConnectionManager()
