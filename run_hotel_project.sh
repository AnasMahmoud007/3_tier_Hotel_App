#!/bin/bash

# --- Configuration ---
SQL_SERVER_IMAGE="anasmahmoud007/devops-project-depi:hotel-sqlserver-final"
# Removed WEB_APP_IMAGE as we are splitting into frontend and backend

# --- New Image and Container Names ---
BACKEND_IMAGE="hotel-backend-image"
FRONTEND_IMAGE="hotel-frontend-image"
SQL_SERVER_CONTAINER_NAME="hotel_db_container"
BACKEND_CONTAINER_NAME="hotel_backend_container"
FRONTEND_CONTAINER_NAME="hotel_frontend_container"
DOCKER_NETWORK_NAME="hotel-network"
SQL_INIT_SCRIPT_PATH="./DatabaseTables/full_init.sql"
FRONTEND_PORT="5000" # Port for the Nginx frontend
BACKEND_INTERNAL_PORT="8080" # Internal port for the backend (as configured in nginx.conf proxy_pass)
SQL_SERVER_PORT="1433"
SA_PASSWORD="Hotel!StrongPass123"

# --- Functions ---

# Function to check if a Docker image exists
image_exists() {
  docker images -q "$1" | grep -q .
}

# Function to check if a Docker container exists (running or stopped)
container_exists() {
  docker ps -a --filter "name=$1" | grep -q "$1"
}

# Function to check if a Docker network exists
network_exists() {
  docker network ls --filter "name=$1" | grep -q "$1"
}

# Function to clean up existing containers and network
cleanup() {
  echo "--- Cleaning up existing Docker resources ---"
  if container_exists "$FRONTEND_CONTAINER_NAME"; then
    echo "Stopping and removing $FRONTEND_CONTAINER_NAME..."
    docker stop "$FRONTEND_CONTAINER_NAME" > /dev/null 2>&1
    docker rm "$FRONTEND_CONTAINER_NAME" > /dev/null 2>&1
  fi
  if container_exists "$BACKEND_CONTAINER_NAME"; then
    echo "Stopping and removing $BACKEND_CONTAINER_NAME..."
    docker stop "$BACKEND_CONTAINER_NAME" > /dev/null 2>&1
    docker rm "$BACKEND_CONTAINER_NAME" > /dev/null 2>&1
  fi
  if container_exists "$SQL_SERVER_CONTAINER_NAME"; then
    echo "Stopping and removing $SQL_SERVER_CONTAINER_NAME..."
    docker stop "$SQL_SERVER_CONTAINER_NAME" > /dev/null 2>&1
    docker rm "$SQL_SERVER_CONTAINER_NAME" > /dev/null 2>&1
  fi
  if network_exists "$DOCKER_NETWORK_NAME"; then
    echo "Removing $DOCKER_NETWORK_NAME..."
    docker network rm "$DOCKER_NETWORK_NAME" > /dev/null 2>&1
  fi
  echo "Cleanup complete."
}

# --- Main Script ---

echo "--- Starting Hotel Project Setup ---"

# 1. Clean up old resources just in case
cleanup

# 2. Create Docker Network
echo "2. Creating Docker network '$DOCKER_NETWORK_NAME'ப்பான"
if ! network_exists "$DOCKER_NETWORK_NAME"; then
  docker network create "$DOCKER_NETWORK_NAME" || { echo "Error creating network. Exiting."; exit 1; }
  echo "Network '$DOCKER_NETWORK_NAME' created."
else
  echo "Network '$DOCKER_NETWORK_NAME' already exists."
fi

# 3. Build Docker Images
echo "3. Building Docker images..."

# --- Build Backend Image ---
echo "Building backend image '$BACKEND_IMAGE' from Dockerfile.backend..."
docker build -f Dockerfile.backend -t "$BACKEND_IMAGE" . || { echo "Error building backend image. Exiting."; exit 1; }

# --- Build Frontend Image ---
echo "Building frontend image '$FRONTEND_IMAGE' from frontend/Dockerfile.frontend..."
docker build -f frontend/Dockerfile.frontend -t "$FRONTEND_IMAGE" frontend/ || { echo "Error building frontend image. Exiting."; exit 1; }

echo "Docker images built."

# 4. Run SQL Server Container
echo "4. Running SQL Server container '$SQL_SERVER_CONTAINER_NAME'ப்பான"
if container_exists "$SQL_SERVER_CONTAINER_NAME"; then
  echo "Container '$SQL_SERVER_CONTAINER_NAME' already exists. Cleaning up first."
  docker stop "$SQL_SERVER_CONTAINER_NAME" > /dev/null 2>&1
  docker rm "$SQL_SERVER_CONTAINER_NAME" > /dev/null 2>&1
fi

docker run -d \
  --name "$SQL_SERVER_CONTAINER_NAME" \
  --network "$DOCKER_NETWORK_NAME" \
  -e 'ACCEPT_EULA=Y' \
  -e "MSSQL_SA_PASSWORD=$SA_PASSWORD" \
  -e 'MSSQL_PID=Developer' \
  -p "$SQL_SERVER_PORT":"$SQL_SERVER_PORT" \
  --user root \
  "$SQL_SERVER_IMAGE" || { echo "Error running SQL Server container. Exiting."; exit 1; }
echo "SQL Server container '$SQL_SERVER_CONTAINER_NAME' started."

# 5. Wait for SQL Server to Start
echo "5. Waiting for SQL Server to start (30 seconds)...";
sleep 30
echo "SQL Server should be ready."

# 6. Execute Database Initialization Script
echo "6. Executing database initialization script '$SQL_INIT_SCRIPT_PATH'ப்பான"
if [ -f "$SQL_INIT_SCRIPT_PATH" ]; then
  docker exec -i "$SQL_SERVER_CONTAINER_NAME" /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$SA_PASSWORD" -N -C < "$SQL_INIT_SCRIPT_PATH" || { echo "Error executing SQL init script. Exiting."; exit 1; }
  echo "Database initialization script executed successfully."
else
  echo "Error: SQL initialization script '$SQL_INIT_SCRIPT_PATH' not found. Skipping database setup."
fi

# 7. Run Backend Application Container
echo "7. Running Backend Application container '$BACKEND_CONTAINER_NAME'ப்பான"
if container_exists "$BACKEND_CONTAINER_NAME"; then
  echo "Container '$BACKEND_CONTAINER_NAME' already exists. Cleaning up first."
  docker stop "$BACKEND_CONTAINER_NAME" > /dev/null 2>&1
  docker rm "$BACKEND_CONTAINER_NAME" > /dev/null 2>&1
fi

docker run -d \
  --name "$BACKEND_CONTAINER_NAME" \
  --network "$DOCKER_NETWORK_NAME" \
  -e "ASPNETCORE_ENVIRONMENT=Development" \
  -e "ConnectionStrings__DefaultConnection=Server=$SQL_SERVER_CONTAINER_NAME;Database=Hotel;User Id=sa;Password=$SA_PASSWORD;TrustServerCertificate=True;" \
  "$BACKEND_IMAGE" || { echo "Error running Backend Application container. Exiting."; exit 1; }
echo "Backend Application container '$BACKEND_CONTAINER_NAME' started."

# 8. Run Frontend Application Container
echo "8. Running Frontend Application container '$FRONTEND_CONTAINER_NAME'ப்பான"
if container_exists "$FRONTEND_CONTAINER_NAME"; then
  echo "Container '$FRONTEND_CONTAINER_NAME' already exists. Cleaning up first."
  docker stop "$FRONTEND_CONTAINER_NAME" > /dev/null 2>&1
  docker rm "$FRONTEND_CONTAINER_NAME" > /dev/null 2>&1
fi

docker run -d \
  --name "$FRONTEND_CONTAINER_NAME" \
  --network "$DOCKER_NETWORK_NAME" \
  -p "$FRONTEND_PORT":80 \
  "$FRONTEND_IMAGE" || { echo "Error running Frontend Application container. Exiting."; exit 1; }
echo "Frontend Application container '$FRONTEND_CONTAINER_NAME' started."


echo "--- Hotel Project Setup Complete ---"

# 9. Accessing the Application
echo ""
echo "Access the application by opening your web browser and navigating to:"
echo "http://localhost:$FRONTEND_PORT"

echo "Login Credentials (if applicable for backend APIs):"
echo "  Username: testuser"
echo "  Password: password123"
echo "  (Alternatively: admin / admin123)"

echo "--- Important: The frontend is static. Dynamic content will be loaded from the backend APIs. ---"

# 10. Cleanup Instructions
echo "To clean up and stop/remove the containers and network when you are done, run the following commands:"
echo "docker stop $FRONTEND_CONTAINER_NAME $BACKEND_CONTAINER_NAME $SQL_SERVER_CONTAINER_NAME"
echo "docker rm $FRONTEND_CONTAINER_NAME $BACKEND_CONTAINER_NAME $SQL_SERVER_CONTAINER_NAME"
echo "docker network rm $DOCKER_NETWORK_NAME"