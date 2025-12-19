#!/bin/bash

# --- Configuration ---
NEXUS_REGISTRY="localhost:8082"
NEXUS_REPO_NAME="docker_private_repo"

SQL_SERVER_IMAGE="$NEXUS_REGISTRY/$NEXUS_REPO_NAME/hotel-sqlserver-final:latest"
BACKEND_IMAGE="$NEXUS_REGISTRY/$NEXUS_REPO_NAME/hotel-backend-image:latest"
FRONTEND_IMAGE="$NEXUS_REGISTRY/$NEXUS_REPO_NAME/hotel-frontend-image:latest"

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

echo "--- Starting Hotel Project Setup (Pulling from Nexus) ---"

# 1. Clean up old resources just in case
cleanup

# 2. Docker Login to Nexus
echo "2. Logging into Nexus Docker Registry '$NEXUS_REGISTRY' நான"
docker login "$NEXUS_REGISTRY" || { echo "Error: Docker login to Nexus failed. Exiting."; exit 1; }
echo "Successfully logged into Nexus."

# 3. Create Docker Network
echo "3. Creating Docker network '$DOCKER_NETWORK_NAME' நான"
if ! network_exists "$DOCKER_NETWORK_NAME"; then
  docker network create "$DOCKER_NETWORK_NAME" || { echo "Error creating network. Exiting."; exit 1; }
  echo "Network '$DOCKER_NETWORK_NAME' created."
else
  echo "Network '$DOCKER_NETWORK_NAME' already exists."
fi

# 4. Pull Docker Images from Nexus
echo "4. Pulling Docker images from Nexus..."

echo "Pulling SQL Server image '$SQL_SERVER_IMAGE' நான"
docker pull "$SQL_SERVER_IMAGE" || { echo "Error pulling SQL Server image from Nexus. Exiting."; exit 1; }

echo "Pulling backend image '$BACKEND_IMAGE' நான"
docker pull "$BACKEND_IMAGE" || { echo "Error pulling backend image from Nexus. Exiting."; exit 1; }

echo "Pulling frontend image '$FRONTEND_IMAGE' நான"
docker pull "$FRONTEND_IMAGE" || { echo "Error pulling frontend image from Nexus. Exiting."; exit 1; }

echo "Docker images pulled from Nexus."

# 5. Run SQL Server Container
echo "5. Running SQL Server container '$SQL_SERVER_CONTAINER_NAME' நான"
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

# 6. Wait for SQL Server to Start
echo "6. Waiting for SQL Server to start (30 seconds)...";
sleep 30
echo "SQL Server should be ready."

# 7. Execute Database Initialization Script
echo "7. Executing database initialization script '$SQL_INIT_SCRIPT_PATH' நான"
if [ -f "$SQL_INIT_SCRIPT_PATH" ]; then
  docker exec -i "$SQL_SERVER_CONTAINER_NAME" /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$SA_PASSWORD" -N -C < "$SQL_INIT_SCRIPT_PATH" || { echo "Error executing SQL init script. Exiting."; exit 1; }
  echo "Database initialization script executed successfully."
else
  echo "Error: SQL initialization script '$SQL_INIT_SCRIPT_PATH' not found. Skipping database setup."
fi

# 8. Run Backend Application Container
echo "8. Running Backend Application container '$BACKEND_CONTAINER_NAME' நான"
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

# 9. Run Frontend Application Container
echo "9. Running Frontend Application container '$FRONTEND_CONTAINER_NAME' நான"
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


echo "--- Hotel Project Setup Complete (Pulled from Nexus) ---"

# 10. Accessing the Application
echo ""
echo "Access the application by opening your web browser and navigating to:"
echo "http://localhost:$FRONTEND_PORT"

echo "Login Credentials (if applicable for backend APIs):"
echo "  Username: testuser"
echo "  Password: password123"
echo "  (Alternatively: admin / admin123)"

echo "--- Important: The frontend is static. Dynamic content will be loaded from the backend APIs. ---"

# 11. Cleanup Instructions
echo "To clean up and stop/remove the containers and network when you are done, run the following commands:"
echo "docker stop $FRONTEND_CONTAINER_NAME $BACKEND_CONTAINER_NAME $SQL_SERVER_CONTAINER_NAME"
echo "docker rm $FRONTEND_CONTAINER_NAME $BACKEND_CONTAINER_NAME $SQL_SERVER_CONTAINER_NAME"
echo "docker network rm $DOCKER_NETWORK_NAME"
