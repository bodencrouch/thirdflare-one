# systemd user daemon

Install with systemd user unit:

```bash
./thirdflare-one install --service
systemctl --user enable --now thirdflare-one.service
```

## Default posture

The packaged unit runs **API-only** (Web UI off). Enable UI via config file or drop-in:

```ini
[Service]
Environment=THIRDFLARE_WEBUI=1
```

## Commands

```bash
systemctl --user status thirdflare-one.service
journalctl --user -u thirdflare-one.service -f
systemctl --user restart thirdflare-one.service
```

## Health

```bash
curl -s http://127.0.0.1:3847/api/health
```

Unit files live under `packaging/systemd/` in the repository.
