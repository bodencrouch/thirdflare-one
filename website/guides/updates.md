# Updates

Client self-update checks GitHub releases against `config/update-manifest.json`.

## API

```bash
curl -s http://127.0.0.1:3847/api/update/check | jq
curl -X POST http://127.0.0.1:3847/api/update/apply   # AppImage apply when supported
```

## Channels

Stable and beta pointers live in the manifest. UI exposes channel selection via combobox (official repo and forks — not free-text).

## Pipeline

Release → manifest bump → client check. Maintainer docs: [UPDATES.md](https://github.com/bodencrouch/thirdflare-one/blob/main/docs/UPDATES.md).

## Tests

```bash
npm run test:update
```
