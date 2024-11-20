#!/bin/bash
set -e
file_path=$(
    cd $(dirname $0)
    pwd
)
cd ${file_path} # Change the working directory to the directory of the current file

deno run -A src/main.js $@
