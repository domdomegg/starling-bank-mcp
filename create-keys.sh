#!/usr/bin/env bash

set -euo pipefail

if ! command -v openssl &> /dev/null
then
    echo "openssl is not installed. Please install it and try again."
    exit 1
fi

# if any of the keys already exist (OR), exit
if [ -f key-api-private.pem ] || [ -f key-api-public.pem ] || [ -f key-rotation-private.pem ] || [ -f key-rotation-public.pem ]
then
    echo "One or more of the keys files already exist. Ensure they aren't used, then remove them and try again."
    exit 1
fi

openssl ecparam -name secp256k1 -genkey -noout -out key-api-private.pem
openssl ec -in key-api-private.pem -pubout > key-api-public.pem

openssl ecparam -name secp256k1 -genkey -noout -out key-rotation-private.pem
openssl ec -in key-rotation-private.pem -pubout > key-rotation-public.pem

echo "Successfully created API and rotation keys!"
