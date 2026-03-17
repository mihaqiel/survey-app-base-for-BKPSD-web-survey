-- CreateTable BlockedIp
CREATE TABLE IF NOT EXISTS "BlockedIp" (
    "id"           TEXT NOT NULL,
    "ip"           TEXT NOT NULL,
    "reason"       TEXT,
    "blockedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "message"      TEXT,
    "messageAt"    TIMESTAMP(3),
    "messageEmail" TEXT,
    CONSTRAINT "BlockedIp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex unique on ip
CREATE UNIQUE INDEX IF NOT EXISTS "BlockedIp_ip_key" ON "BlockedIp"("ip");npx prisma migrate resolve --applied 20260316000000_add_blocked_ip
