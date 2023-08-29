#!/bin/sh
# check if circom is installed
if ! [ -x "$(command -v circom)" ]; then
  echo 'Error: circom is not installed. Please refer to https://docs.circom.io/getting-started/installation/' >&2
  exit 1
fi

rm -rf ./dist/zksnarkBuild

cp -r ../../node_modules/@unirep/circuits/zksnarkBuild/. ./zksnarkBuild
cp -rf ./zksnarkBuild ./dist/zksnarkBuild