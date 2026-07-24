Name:           thirdflare-one
Version:        %{version}
Release:        1%{?dist}
Summary:        ThirdFlare One — unofficial Cloudflare One client via warp-cli

License:        MIT
URL:            https://github.com/bodencrouch/thirdflare-one
Source0:        https://github.com/bodencrouch/thirdflare-one/releases/download/v%{version}/thirdflare-one-%{version}-src.tar.gz

BuildArch:      noarch
Requires:       nodejs >= 20
Recommends:     python3-pyqt6, python3-pyqt6-webengine, yad, libnotify

%description
ThirdFlare One wraps the host Cloudflare WARP client (warp-cli) with a local
HTTP API and optional browser UI. Requires Cloudflare WARP on the host.

%prep
%autosetup -n .

%build
# JavaScript payload — no compile step

%install
rm -rf %{buildroot}
install -d %{buildroot}/usr/lib/thirdflare
install -m 0644 server.js package.json %{buildroot}/usr/lib/thirdflare/
cp -a public assets lib config %{buildroot}/usr/lib/thirdflare/
install -d %{buildroot}/usr/lib/thirdflare/scripts %{buildroot}/usr/lib/thirdflare/bin
install -m 0755 scripts/health-check.mjs scripts/port-open.mjs scripts/thirdflare-nft-apply \
  scripts/tray-qt.py scripts/tray-sni.py scripts/tray_api.py scripts/tray-warp-action.py \
  %{buildroot}/usr/lib/thirdflare/scripts/
install -m 0755 bin/thirdflare bin/thirdflare-tray bin/thirdflare-one-gui bin/thirdflare-one-tray \
  %{buildroot}/usr/lib/thirdflare/bin/
install -d %{buildroot}/usr/bin
install -m 0755 packaging/usr-bin-wrapper.sh %{buildroot}/usr/bin/thirdflare
install -m 0755 packaging/usr-bin-alias-wrapper.sh %{buildroot}/usr/bin/thirdflare-one
install -m 0755 packaging/usr-bin-tray-wrapper.sh %{buildroot}/usr/bin/thirdflare-one-tray
install -d %{buildroot}/usr/share/polkit-1/actions
install -m 0644 packaging/polkit/com.thirdflare.one.policy \
  %{buildroot}/usr/share/polkit-1/actions/com.thirdflare.one.policy
install -d %{buildroot}/usr/share/applications
install -m 0644 packaging/thirdflare-one.desktop %{buildroot}/usr/share/applications/thirdflare-one.desktop
install -m 0644 packaging/thirdflare-one-tray.desktop %{buildroot}/usr/share/applications/thirdflare-one-tray.desktop
install -d %{buildroot}/usr/share/icons/hicolor/scalable/apps
install -m 0644 assets/thirdflare.svg %{buildroot}/usr/share/icons/hicolor/scalable/apps/thirdflare.svg
install -d %{buildroot}/usr/lib/systemd/user
install -m 0644 packaging/thirdflare-one.service %{buildroot}/usr/lib/systemd/user/thirdflare-one.service
install -d %{buildroot}/usr/share/licenses/thirdflare-one
install -m 0644 LICENSE %{buildroot}/usr/share/licenses/thirdflare-one/LICENSE
install -d %{buildroot}/usr/share/doc/thirdflare-one
install -m 0644 README.md %{buildroot}/usr/share/doc/thirdflare-one/README.md

%files
/usr/bin/thirdflare
/usr/bin/thirdflare-one
/usr/bin/thirdflare-one-tray
/usr/lib/thirdflare/
/usr/share/applications/thirdflare-one.desktop
/usr/share/applications/thirdflare-one-tray.desktop
/usr/share/polkit-1/actions/com.thirdflare.one.policy
/usr/share/icons/hicolor/scalable/apps/thirdflare.svg
/usr/lib/systemd/user/thirdflare-one.service
/usr/share/licenses/thirdflare-one/LICENSE
/usr/share/doc/thirdflare-one/README.md

%changelog
* Sat Jul 18 2026 ThirdFlare One contributors - %{version}-1
- Release %{version}
