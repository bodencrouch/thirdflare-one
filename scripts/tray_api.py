#!/usr/bin/env python3
"""Shared daemon API client and WARP connection control for tray/native shells."""

from __future__ import annotations

import json
import os
import subprocess
import urllib.error
import urllib.request
from typing import Any


DEFAULT_PORT = 4173
PORT_SCAN = 31


def app_dir() -> str:
  env = os.environ.get("THIRDFLARE_APP_DIR")
  if env:
    return env
  return os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))


def launcher_path(root: str | None = None) -> str:
  root = root or app_dir()
  return os.path.join(root, "bin", "thirdflare")


def ensure_daemon(launcher: str | None = None) -> None:
  launcher = launcher or launcher_path()
  probe = subprocess.run(
    [launcher, "--status"],
    check=False,
    stdout=subprocess.DEVNULL,
    stderr=subprocess.DEVNULL,
    timeout=5,
  )
  if probe.returncode == 0:
    return
  subprocess.run(
    [launcher, "--no-open"],
    check=False,
    stdout=subprocess.DEVNULL,
    stderr=subprocess.DEVNULL,
    timeout=15,
  )


def connection_control(snapshot: dict[str, Any] | None) -> dict[str, Any]:
  """
  Single connect/disconnect control — mirrors public/app.js connectionToggle().
  Returns action (connect|disconnect|None), label, and enabled flag.
  """
  snap = snapshot or {}
  daemon = snap.get("daemon") or {}
  status = snap.get("status") or {}
  if not daemon.get("available", True):
    return {"action": None, "label": "Connect", "enabled": False}
  connected = bool(status.get("connected"))
  connecting = bool(status.get("connecting"))
  if connecting:
    return {"action": None, "label": "Connecting…", "enabled": False}
  if connected:
    return {"action": "disconnect", "label": "Disconnect", "enabled": True}
  return {"action": "connect", "label": "Connect", "enabled": True}


class ThirdFlareClient:
  """Minimal HTTP client for the local ThirdFlare One daemon."""

  def __init__(self, host: str = "127.0.0.1") -> None:
    self.host = host
    env_port = os.environ.get("THIRDFLARE_PORT") or os.environ.get("CLOUDFLARE_ONE_GUI_PORT")
    self.base_port = int(env_port) if env_port else DEFAULT_PORT
    self.base_url: str | None = None
    self.discover()

  def discover(self) -> bool:
    for port in range(self.base_port, self.base_port + PORT_SCAN):
      url = f"http://{self.host}:{port}/api/health"
      try:
        with urllib.request.urlopen(url, timeout=1.5) as response:
          payload = json.loads(response.read().decode("utf-8"))
      except (OSError, urllib.error.URLError, json.JSONDecodeError, TimeoutError):
        continue
      app_id = payload.get("app")
      if payload.get("ok") and app_id in ("thirdflare", "thirdflare-one", "cloudflare-one-gui"):
        self.base_url = f"http://{self.host}:{port}"
        return True
    self.base_url = None
    return False

  def _request(self, method: str, path: str, body: dict[str, Any] | None = None) -> dict[str, Any]:
    if not self.base_url and not self.discover():
      raise RuntimeError("ThirdFlare One daemon is not running.")
    assert self.base_url
    data = None
    headers = {"Accept": "application/json"}
    if body is not None:
      data = json.dumps(body).encode("utf-8")
      headers["Content-Type"] = "application/json"
    request = urllib.request.Request(
      f"{self.base_url}{path}",
      data=data,
      headers=headers,
      method=method,
    )
    try:
      with urllib.request.urlopen(request, timeout=20) as response:
        raw = response.read().decode("utf-8")
    except urllib.error.HTTPError as exc:
      detail = exc.read().decode("utf-8", errors="replace")
      raise RuntimeError(detail or str(exc)) from exc
    if not raw.strip():
      return {}
    return json.loads(raw)

  def get(self, path: str) -> dict[str, Any]:
    return self._request("GET", path)

  def post(self, path: str, body: dict[str, Any] | None = None) -> dict[str, Any]:
    return self._request("POST", path, body)

  def snapshot(self) -> dict[str, Any]:
    return self.get("/api/snapshot")

  def action(self, name: str) -> dict[str, Any]:
    return self.post("/api/action", {"action": name})

  def enable_webui_session(self) -> None:
    self.post("/api/config/session", {"config": {"webui": {"enabled": True}}})

  def webui_enabled(self) -> bool:
    try:
      payload = self.get("/api/config")
      return bool(payload.get("config", {}).get("webui", {}).get("enabled"))
    except Exception:
      return False

  def ensure_webui(self, launcher: str | None = None) -> None:
    launcher = launcher or launcher_path()
    if self.webui_enabled():
      return
    try:
      self.enable_webui_session()
    except Exception:
      pass
    if self.webui_enabled():
      return
    subprocess.run(
      [launcher, "--stop"],
      check=False,
      stdout=subprocess.DEVNULL,
      stderr=subprocess.DEVNULL,
      timeout=10,
    )
    env = os.environ.copy()
    env["THIRDFLARE_WEBUI"] = "1"
    subprocess.run(
      [launcher, "--no-open"],
      check=False,
      stdout=subprocess.DEVNULL,
      stderr=subprocess.DEVNULL,
      timeout=15,
      env=env,
    )
    self.discover()

  def app_url(self) -> str:
    if not self.base_url and not self.discover():
      raise RuntimeError("ThirdFlare One daemon is not running.")
    base = self.base_url or f"http://{self.host}:{self.base_port}"
    return f"{base}/?shell=1"

  def run_connection_action(self) -> dict[str, Any]:
    """Perform the authoritative connect or disconnect for the current snapshot."""
    snap = self.snapshot()
    ctrl = connection_control(snap)
    if not ctrl["enabled"] or not ctrl["action"]:
      return {"ok": False, "skipped": True, "control": ctrl, "snapshot": snap}
    result = self.action(str(ctrl["action"]))
    return {"ok": True, "control": ctrl, "result": result, "snapshot": snap}


def snapshot_label(snapshot: dict[str, Any]) -> str:
  daemon = snapshot.get("daemon") or {}
  status = snapshot.get("status") or {}
  if not daemon.get("available", True):
    return "daemon unavailable"
  return str(status.get("label") or "ThirdFlare One")
