class CloudflareOneGui < Formula
  desc "Desktop-style GUI for Cloudflare WARP via warp-cli"
  homepage "https://github.com/bodencrouch/cloudflare-one-gui-linux"
  url "https://github.com/bodencrouch/cloudflare-one-gui-linux/releases/download/v0.2.2/cloudflare-one-gui-0.2.2-src.tar.gz"
  sha256 "d2fd975a354feb242b933bf4703d16f891d34dbbf43797fcecc3f921a4691d06"
  license "MIT"

  depends_on "node@20"

  def install
    libexec.install "server.js", "package.json", "public", "assets", "scripts", "bin", "LICENSE", "README.md"
    (bin/"cloudflare-one-gui").write <<~EOS
      #!/bin/bash
      export PATH="#{Formula["node@20"].bin}:$PATH"
      exec "#{libexec}/bin/cloudflare-one-gui" "$@"
    EOS
    chmod 0755, bin/"cloudflare-one-gui"
  end

  def caveats
    <<~EOS
      Requires Cloudflare WARP (warp-cli) installed separately on macOS.
      Launch with: cloudflare-one-gui --no-open
    EOS
  end

  test do
    assert_match "Cloudflare One GUI", shell_output("#{bin}/cloudflare-one-gui --help")
  end
end
