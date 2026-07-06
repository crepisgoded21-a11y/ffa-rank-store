const NICKNAME_BLACKLIST = [
  "admin", "administrator", "owner", "founder", "staff", "moderator",
  "mod", "console", "system", "developer", "dev", "helper",
];

export function isValidIgn(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9_]{3,16}$/.test(value);
}

export function isValidHexColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9A-Fa-f]{6}$/.test(value);
}

export function validateNickname(nickname: unknown): { ok: boolean; reason?: string } {
  if (typeof nickname !== "string") return { ok: false, reason: "Nickname must be a string." };
  if (nickname.length < 3 || nickname.length > 16) {
    return { ok: false, reason: "Nickname must be 3-16 characters." };
  }
  if (!/^[A-Za-z0-9_ ]+$/.test(nickname)) {
    return { ok: false, reason: "Only letters, numbers, underscores and spaces are allowed." };
  }
  const lower = nickname.toLowerCase();
  if (NICKNAME_BLACKLIST.some((word) => lower.includes(word))) {
    return { ok: false, reason: "That nickname isn't allowed." };
  }
  return { ok: true };
}
