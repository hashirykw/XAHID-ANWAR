/* Same-site copy of a Cambridge past paper, so phones can draw it with PDF.js.
   Only fetches files from the public past-paper archive, nothing else. */
const SRC = "https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/";
const OK = /^(1123|0500|0510|0511)_[msw]\d{2}_[a-z]{2}_\d{1,2}\.pdf$/i;

module.exports = async (req, res) => {
  const f = String((req.query && req.query.f) || "");
  if (!OK.test(f)) { res.statusCode = 400; return res.end("Bad paper name"); }
  try {
    const up = await fetch(SRC + f, { headers: { "User-Agent": "Mozilla/5.0 (compatible; englishwithsxa.com paper viewer)", Accept: "application/pdf" }, redirect: "follow" });
    const type = up.headers.get("content-type") || "";
    if (!up.ok || !/pdf|octet-stream/i.test(type)) { res.statusCode = up.status === 404 ? 404 : 502; res.setHeader("Cache-Control", "public, s-maxage=3600"); return res.end("Paper not available"); }
    const buf = Buffer.from(await up.arrayBuffer());
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Length", buf.length);
    res.setHeader("Content-Disposition", `inline; filename="${f}"`);
    /* papers never change, so the CDN keeps them for a year */
    res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=31536000, immutable");
    res.end(buf);
  } catch (e) {
    res.statusCode = 502; res.end("Archive unreachable");
  }
};
