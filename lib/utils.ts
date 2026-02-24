export function generateToken(serviceName: string): string {
  // 1. Initials (e.g. "Layanan Kepegawaian" -> "LK")
  const initials = serviceName
    .split(" ")
    .map((w) => w[0].toUpperCase())
    .join("")
    .substring(0, 3);

  // 2. Date Code (e.g. "202502")
  const now = new Date();
  const dateCode = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;

  // 3. Random Suffix (4 chars, no confusing letters like I/O)
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `${initials}-${dateCode}-${suffix}`;
}