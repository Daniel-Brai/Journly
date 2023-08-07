#!/bin/bash

IMAGE_NAME="journly"
TAG="latest"
DOCKERFILE_PATH="../Dockerfile"
DOCKERCOMPOSE_FILE_PATH="docker-compose.dev.yml"
NETWORK_NAME="journly-network"

check_docker_installed() {
    if ! command -v docker &> /dev/null; then
        echo "Docker is not installed. Please install Docker before running this script."
        exit 1
    fi
}

build_docker_image() {
    echo "Building Docker image: $IMAGE_NAME:$TAG"
    docker build -t "$IMAGE_NAME:$TAG" -f "$DOCKERFILE_PATH" .
    echo "Docker image build for Journly completed"
}

run_created_docker_image() {
  echo "Running docker image: $IMAGE_NAME:$TAG"
  docker run -p 8000:8000 "$IMAGE_NAME:$TAG"
}

main() {
    check_docker_installed
    build_docker_image
    run_created_docker_image
}

main
