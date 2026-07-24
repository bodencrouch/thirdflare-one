# Actions catalog

`POST /api/action` with JSON body `{ "action": "<name>", "value": "...", "secondary": "..." }`.

## Connection

| action | warp-cli |
|--------|----------|
| `connect` | `connect` |
| `disconnect` | `disconnect` |

## Registration

| action | Notes |
|--------|-------|
| `register` | New consumer registration |
| `registerOrganization` | `value` = team name |
| `applyLicense` | `value` = license key |
| `registrationToken` | Zero Trust token; pauses kill switch |
| `deleteRegistration` | Remove registration |

## Mode & tunnel

| action | Notes |
|--------|-------|
| `setMode` | `value`: `warp`, `proxy`, etc. |
| `setProtocol` | `value`: `MASQUE`, `WireGuard`, … |
| `setMasqueOptions` | MASQUE tuning |
| `setProxyPort` | Local proxy port |
| `resetProtocol` | Reset tunnel protocol |
| `rotateKeys` | Rotate tunnel keys |
| `resetEndpoint` | Reset tunnel endpoint |
| `resetMasqueOptions` | Reset MASQUE options |
| `enableLocalProxy` | Sets MASQUE + proxy mode (composite) |

## Split tunnel

| action | Notes |
|--------|-------|
| `addSplitIp` / `removeSplitIp` | Host IP |
| `addSplitIpRange` / `removeSplitIpRange` | CIDR range |
| `addSplitHost` / `removeSplitHost` | Domain |
| `resetSplitIps` / `resetSplitHosts` | Reset lists |

## DNS

| action | Notes |
|--------|-------|
| `setFamilies` | DNS family mode |
| `setGatewayId` | Gateway ID |
| `resetGatewayId` | Clear gateway |
| `addDnsFallback` / `removeDnsFallback` | Fallback resolvers |
| `dnsLogEnable` / `dnsLogDisable` | DNS logging |

## Trust & override

| action | Notes |
|--------|-------|
| `trustedWifiEnable` / `trustedWifiDisable` | Trusted Wi‑Fi |
| `trustedEthernetEnable` / `trustedEthernetDisable` | Trusted Ethernet |
| `addTrustedSsid` / `removeTrustedSsid` | SSID list |
| `resetTrustedSsids` | Clear SSIDs |
| `allowLocalNetwork` / `stopLocalNetworkOverride` | LAN access override |
| `overrideCode` / `overrideUnlock` | Admin override |

## Environment

| action | Notes |
|--------|-------|
| `environmentNormal` | Normal environment |
| `environmentFedramp` | FedRAMP-High |
| `environmentReset` | Reset environment |
| `resetSettings` | Reset WARP settings |

## Advanced

| action | Notes |
|--------|-------|
| `runCustom` | Parsed warp-cli args in `value` (guarded) |
| `accessReauth` | Access re-auth debug |
| `setVnet` | Virtual network selection |

Unsupported actions return **400**.
