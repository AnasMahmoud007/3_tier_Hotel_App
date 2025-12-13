#!/bin/bash

WEB_APP_CONTAINER_NAME="hotel_webapp_container"
SQL_SERVER_CONTAINER_NAME="hotel_db_container"
DOCKER_NETWORK_NAME="hotel-network"
WEB_APP_IMAGE_DOCKERHUB="anasmahmoud007/devops-project-depi:hotel-webapp-updated"
SQL_SERVER_IMAGE_DOCKERHUB="anasmahmoud007/devops-project-depi:hotel-sqlserver-final"
WEB_APP_IMAGE_LOCAL="hotel-webapp-updated:latest"
SQL_SERVER_IMAGE_LOCAL="hotel-sqlserver-final:latest"

echo "--- Cleaning up Hotel Project Docker resources ---"

# Stop and remove containers
echo "Stopping and removing containers..."
docker stop "$WEB_APP_CONTAINER_NAME" "$SQL_SERVER_CONTAINER_NAME" > /dev/null 2>&1
docker rm "$WEB_APP_CONTAINER_NAME" "$SQL_SERVER_CONTAINER_NAME" > /dev/null 2>&1
echo "Containers stopped and removed."

# Remove Docker network
echo "Removing Docker network '$DOCKER_NETWORK_NAME'..."
docker network rm "$DOCKER_NETWORK_NAME" > /dev/null 2>&1
echo "Network removed."

# Remove Docker images
echo "Removing Docker images..."
docker rmi "$WEB_APP_IMAGE_DOCKERHUB" "$SQL_SERVER_IMAGE_DOCKERHUB" > /dev/null 2>&1
docker rmi "$WEB_APP_IMAGE_LOCAL" "$SQL_SERVER_IMAGE_LOCAL" > /dev/null 2>&1
echo "Images removed."

echo "--- Hotel Project cleanup complete ---"
