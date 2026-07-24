class ThirdflareOne < Formula
  desc "ThirdFlare One — unofficial Cloudflare One client via warp-cli"
  homepage "https://github.com/bodencrouch/thirdflare-one"
  url "https://github.com/bodencrouch/thirdflare-one/releases/download/v0.2.7/thirdflare-one-0.2.7-src.tar.gz"
  sha256 "0019dfc4b32d63c1392aa264aed2253c1e0c2fb09216f8e2cc269bbfb8bb49b5"
  license "MIT"

  depends_on "node@20"

  def install
    libexec.install "server.js", "package.json", "public", "assets", "scripts", "bin", "LICENSE", "README.md"
    (bin/"thirdflare-one").write <<~EOS
      #!/bin/bash
      export PATH="#{Formula["node@20"].bin}:$PATH"
      exec "#{libexec}/bin/thirdflare" "$@"
    EOS
    chmod 0755, bin/"thirdflare-one"
  end

  def caveats
    <<~EOS
      Requires Cloudflare WARP (warp-cli) installed separately on macOS.
      Launch with: thirdflare-one --no-open
    EOS
  end

  test do
    assert_match "ThirdFlare One", shell_output("#{bin}/thirdflare-one --help")
  end
end
