#!/bin/bash

cd dev-server

declare -r image_name=dev-server
declare -r container_name=$image_name-burk

docker build . -t $image_name
docker kill $container_name &>/dev/null
docker run -d --rm --name $container_name -p8080:8080 -v "$(pwd)"/json:/app/www $image_name
