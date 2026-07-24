import { KILLSWITCH_TABLE } from "./rules.mjs";

/**
 * Validate nft script content before privileged apply (kill switch table only).
 * @param {string} content
 * @returns {{ ok: boolean, reason?: string }}
 */
export function validateNftScript(content) {
  const text = String(content || "");
  if (!text.trim()) {
    return { ok: false, reason: "empty script" };
  }

  const hasKillSwitchTable =
    text.includes(`table inet ${KILLSWITCH_TABLE}`) ||
    text.includes(`destroy table inet ${KILLSWITCH_TABLE}`) ||
    text.includes(`delete table inet ${KILLSWITCH_TABLE}`);

  if (!hasKillSwitchTable) {
    return { ok: false, reason: "missing kill switch table" };
  }

  const tableNames = [...text.matchAll(/\btable inet (\S+)/g)].map((match) => match[1]);
  const foreign = tableNames.filter((name) => name !== KILLSWITCH_TABLE);
  if (foreign.length) {
    return { ok: false, reason: `foreign table: ${foreign[0]}` };
  }

  if (/\b(flush|add rule|insert rule)\b/i.test(text) && !text.includes(`chain output`)) {
    return { ok: false, reason: "unexpected nft directives" };
  }

  return { ok: true };
}
