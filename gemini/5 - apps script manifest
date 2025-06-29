# Request

The manifest file currently shows now oauthScopes. I will create one. where in the appscript json object does it belong?

# Response

Of course. That's a great question. If your appsscript.json file is empty or doesn't contain the oauthScopes key, you need to create the JSON structure for it.

The oauthScopes key is an array that belongs inside the top-level JSON object, like this:

JSON

```
{
  "timeZone": "America/New_York",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "oauthScopes": [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/script.external_request",
    "https://www.googleapis.com/auth/cloud-platform"
  ]
}
```

You can copy and paste the entire structure above into your appsscript.json file. The other fields like timeZone and runtimeVersion are standard defaults that are good to have. The most important part is adding the oauthScopes array as a key within the main {} brackets.
