#!/usr/bin/env bash

start() {
  docker compose up -d
}

if start; then
  echo "Cool!"
else
  echo -n "Github-brukernavn: "
  read GITHUB_USERNAME

  ACCESS_TOKEN=$(cat ~/.gradle/gradle.properties | grep githubPassword | sed 's/^githubPassword=//')

  if [[ -z "$ACCESS_TOKEN" ]]; then
    echo "Fant ikke Github-token"
    echo -n "Lim inn Github-token her: "
    read ACCESS_TOKEN
  fi

  echo $ACCESS_TOKEN | docker login https://docker.pkg.github.com --username=${GITHUB_USERNAME} --password-stdin

  start
fi
