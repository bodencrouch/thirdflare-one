# curl cookbook

Start daemon:

```bash
thirdflare --no-open
```

## Health & version

```bash
curl -s http://127.0.0.1:3847/api/health | jq
curl -s http://127.0.0.1:3847/api/version | jq
```

## Status snapshot

```bash
curl -s http://127.0.0.1:3847/api/snapshot | jq '.status'
curl -s http://127.0.0.1:3847/api/account | jq
```

## Connect / disconnect

```bash
curl -X POST http://127.0.0.1:3847/api/action \
  -H 'Content-Type: application/json' \
  -d '{"action":"connect"}'

curl -X POST http://127.0.0.1:3847/api/action \
  -H 'Content-Type: application/json' \
  -d '{"action":"disconnect"}'
```

## Mode & protocol

```bash
curl -X POST http://127.0.0.1:3847/api/action \
  -H 'Content-Type: application/json' \
  -d '{"action":"setMode","value":"warp"}'

curl -X POST http://127.0.0.1:3847/api/action \
  -H 'Content-Type: application/json' \
  -d '{"action":"setProtocol","value":"MASQUE"}'
```

## Kill switch

```bash
curl -s http://127.0.0.1:3847/api/killswitch | jq

curl -X POST http://127.0.0.1:3847/api/killswitch \
  -H 'Content-Type: application/json' \
  -d '{"enabled":true,"allowLan":false}'
```

## Config session override

```bash
curl -s http://127.0.0.1:3847/api/config | jq

curl -X POST http://127.0.0.1:3847/api/config/session \
  -H 'Content-Type: application/json' \
  -d '{"webui":{"enabled":true}}'
```

## Command log

```bash
curl -s 'http://127.0.0.1:3847/api/logs?since=0' | jq '.entries[-5:]'
```

## Live events (SSE)

```bash
curl -N http://127.0.0.1:3847/api/events
```

## App routing shortcut

```bash
curl -s http://127.0.0.1:3847/api/apps | jq
curl -X POST http://127.0.0.1:3847/api/apps/proxy-launcher \
  -H 'Content-Type: application/json' \
  -d '{"appId":"firefox"}'
```

## Updates

```bash
curl -s http://127.0.0.1:3847/api/update/check | jq
```
