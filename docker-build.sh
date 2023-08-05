#!/bin/bash

IMAGE_NAME="journly"
TAG="latest"
DOCKERFILE_PATH="./Dockerfile"
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

create_docker_network() {
    echo "Building Docker network for image: $IMAGE_NAME:$TAG"
    docker network create "$NETWORK_NAME"
    echo "Docker network for Journly created"
}


main() {
    check_docker_installed
    build_docker_image
    create_docker_network
}

main
