import asyncio
import websockets

async def handler(websocket, path):
    async for message in websocket:
        response = process_message(message)
        await websocket.send(response)

def process_message(message):
    return f"Received: {message}, Hello World!"

start_server = websockets.serve(handler, "localhost", 8765)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
