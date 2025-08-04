# Advanced: Payment Signing Setup

For creating payment requests (i.e. to actually send money) via the tool `payment_create`, you need to do some advanced extra setup. **If you don't need this tool, you don't need to follow any of these steps.**

Some limitations you should be aware of with this tool:
- You can only send payments to payees that are in your Starling Bank account
- You must approve payments in the Starling Bank app

This section will guide you through creating the necessary signing keys, uploading them to the developer portal, and configuring the MCP server to use them.

## Step 1: Creating keys

Create two ECDSA key pairs, one for the API and one for the rotation key.

[Clone this repo](https://github.com/domdomegg/starling-bank-mcp), and run the `./create-keys.sh` script. This will create:
- `key-api-private.pem`
- `key-api-public.pem`
- `key-rotation-private.pem`
- `key-rotation-public.pem`

These files are sensitive and important. If you lose your rotation key after uploading it to the developer portal, you'll get quite stuck so make sure you keep it safe!

## Step 2: Uploading keys to the developer portal

Sign in to the developer portal, and go to the personal access page, then click 'Keys'. Or [click this direct link](https://developer.starlingbank.com/personal/keys).

Click 'Add Key' and select 'ECDSA' as the key type. Paste in the contents of `key-api-public.pem` into the 'Public Key' field, then press next.

<details>
<summary>What if I'm asked for an 'Upload Signature'?</summary>
This might mean you've uploaded the keys already! Try skipping to the next step and see if it works.

Alternatively, this is because you've previously uploaded a rotation key. You will need to generate a signature to upload the API key, from your previous rotation key. See [more details here](https://github.com/starlingbank/api-samples/tree/master/common-examples/key-rotation). Contact Starling Developer support if you no longer have your rotation key.
</details>

Then on the next screen, select 'ECDSA' again, and paste in the contents of `key-rotation-public.pem` into the 'Public Key' field, then press 'Upload key'.

If this works, back in the keys page, you should see the new key in the list. Copy the Key Uid of your API key (NOT rotation key). 

## Step 3: Configuring the MCP server

In your MCP server configuration file, add the following to the `env` variables:
- `STARLING_BANK_PRIVATE_KEY_UID`: The key uid of your API key (NOT rotation key)
- `STARLING_BANK_PRIVATE_KEY_PEM`: The contents of `key-api-private.pem`

When you're done, your configuration might look something like:

```json
{
  "mcpServers": {
    "starling-bank": {
      "command": "npx",
      "args": [
        "-y",
        "starling-bank-mcp"
      ],
      "env": {
        "STARLING_BANK_ACCESS_TOKEN": "eyJhbGciOiJQUzI1NiIsInppcCI6IkdaSVAifQ.aWholeBunchOfStuffContinuesOnHereForAges",
        "STARLING_BANK_PRIVATE_KEY_UID": "b98ede91-8890-40ec-b3a6-52c6c3660c67",
        "STARLING_BANK_PRIVATE_KEY_PEM": "-----BEGIN EC PRIVATE KEY-----\nMHQCAQEEIJ5l5if95mE07k3xylS7o+Xseq1euwKT/uhK1PbG2n7UoAcGBSuBBAAK\noUQDQgAEE47vLhkDOhSBkhyDbP/StwzFXZKkLd68uxwdIsaBHruNEEKp+raVrm4O\ncK9z1fefvDybX+gmhFvKhGqRP3Tg+w==\n-----END EC PRIVATE KEY-----"
      }
    }
  }
}
```

And that's it! Now go ask your AI of choice to send some money to your payees.
