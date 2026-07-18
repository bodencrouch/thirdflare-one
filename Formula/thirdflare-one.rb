class ThirdflareOne < Formula
  desc "ThirdFlare One — unofficial Cloudflare One client via warp-cli"
  homepage "https://github.com/bodencrouch/thirdflare-one"
  url "https://github.com/bodencrouch/thirdflare-one/releases/download/v0.2.7/thirdflare-one-0.2.7-src.tar.gz"
  sha256 "86f7b32b1bb00f94650d48b0a68dd9015d9f6a17b6b214ed75b113de7c9512e4"
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
