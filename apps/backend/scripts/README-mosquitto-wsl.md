# Running Mosquitto MQTT Broker in WSL

## Problem
Mosquitto runs in "local only mode" by default, which means it only listens on `localhost` within WSL, not accessible from Windows.

## Solution: Configure Mosquitto to Listen on All Interfaces

### Option 1: Use Docker with Custom Config (Recommended)

1. **Create a Mosquitto config file in WSL:**
   ```bash
   # In WSL
   mkdir -p ~/mosquitto/config
   cat > ~/mosquitto/config/mosquitto.conf << EOF
   listener 1883 0.0.0.0
   allow_anonymous true
   log_dest stdout
   log_type all
   EOF
   ```

2. **Run Docker with the config file:**
   ```bash
   # In WSL
   docker run -it -p 1883:1883 \
     -v ~/mosquitto/config:/mosquitto/config \
     eclipse-mosquitto
   ```

### Option 2: Use Command Line Arguments

```bash
# In WSL
docker run -it -p 1883:1883 \
  eclipse-mosquitto \
  mosquitto -c /mosquitto-no-auth.conf -p 1883
```

### Option 3: Quick Fix - Override Default Config

```bash
# In WSL - This allows connections from any interface
docker run -it -p 1883:1883 \
  eclipse-mosquitto \
  sh -c "echo 'listener 1883 0.0.0.0' > /tmp/mosquitto.conf && \
         echo 'allow_anonymous true' >> /tmp/mosquitto.conf && \
         mosquitto -c /tmp/mosquitto.conf"
```

## Port Forwarding (Already Done)

You've already set up port forwarding from Windows to WSL:
```powershell
netsh interface portproxy add v4tov4 listenport=1883 listenaddress=127.0.0.1 connectport=1883 connectaddress=172.28.128.14
```

## Verify Connection

1. **Check if Mosquitto is listening on all interfaces:**
   ```bash
   # In WSL
   netstat -tuln | grep 1883
   # Should show: 0.0.0.0:1883 (not just 127.0.0.1:1883)
   ```

2. **Test from Windows:**
   ```powershell
   # Test connection
   Test-NetConnection -ComputerName localhost -Port 1883
   ```

3. **Check health endpoint:**
   ```bash
   curl http://localhost:8000/api/health
   ```

## Health Endpoint

The `/api/health` endpoint now shows detailed MQTT connection status:
- `status`: "connected", "disconnected", or "not_initialized"
- `connected`: boolean
- `brokerUrl`: MQTT broker URL
- `lastConnectionTime`: timestamp of last successful connection
