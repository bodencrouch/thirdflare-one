#!/usr/bin/env python3
"""Unit tests for tray connection_control (mirrors Web UI connectionToggle)."""

from __future__ import annotations

import unittest

from tray_api import connection_control


class ConnectionControlTest(unittest.TestCase):
  def test_disconnected_offers_connect(self) -> None:
    ctrl = connection_control({
      "daemon": {"available": True},
      "status": {"connected": False, "connecting": False, "disconnected": True},
    })
    self.assertEqual(ctrl["action"], "connect")
    self.assertEqual(ctrl["label"], "Connect")
    self.assertTrue(ctrl["enabled"])

  def test_connected_offers_disconnect(self) -> None:
    ctrl = connection_control({
      "daemon": {"available": True},
      "status": {"connected": True, "connecting": False},
    })
    self.assertEqual(ctrl["action"], "disconnect")
    self.assertEqual(ctrl["label"], "Disconnect")
    self.assertTrue(ctrl["enabled"])

  def test_connecting_is_disabled(self) -> None:
    ctrl = connection_control({
      "daemon": {"available": True},
      "status": {"connected": False, "connecting": True},
    })
    self.assertIsNone(ctrl["action"])
    self.assertEqual(ctrl["label"], "Connecting…")
    self.assertFalse(ctrl["enabled"])

  def test_daemon_missing_disables_connect(self) -> None:
    ctrl = connection_control({
      "daemon": {"available": False},
      "status": {},
    })
    self.assertIsNone(ctrl["action"])
    self.assertEqual(ctrl["label"], "Connect")
    self.assertFalse(ctrl["enabled"])


if __name__ == "__main__":
  raise SystemExit(unittest.main())
