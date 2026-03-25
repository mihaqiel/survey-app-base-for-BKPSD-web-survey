/**
 * Pure HTML email template functions.
 * No imports, no side effects — each returns { subject, html }.
 * All templates use inline CSS for maximum email client compatibility.
 */

const BRAND_NAVY   = "#0d2d58";
const BRAND_CYAN   = "#009CC5";
const BRAND_YELLOW = "#FAE705";
const APP_URL      = process.env.NEXT_PUBLIC_APP_URL ?? "https://clever-varahamihira.vercel.app";

// DM Sans loaded via <link> (works in Gmail/Apple Mail); system-font fallbacks for Outlook.
const FONT_BODY    = "'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif";
// Playfair Display cannot be reliably loaded in email — Georgia is the closest serif fallback.
const FONT_HEADING = "Georgia,'Times New Roman',serif";

const CONTACT_EMAIL = "bkpsdm@anambaskab.go.id";
const CONTACT_PHONE = "(0778) xxxx xxx";

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

/** Sequential ticket number: "PGD-2026-00023" */
function formatTicket(nomorUrut: number, createdAt: Date | string): string {
  const year = new Date(createdAt).getFullYear();
  return `PGD-${year}-${String(nomorUrut).padStart(5, "0")}`;
}

/** Indonesian long date: "24 Maret 2026" */
function formatDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  });
}

/** Info-table row: label small/uppercase/gray, value large/bold/dark */
function infoRow(label: string, value: string, isLast = false): string {
  const border = isLast ? "" : "border-bottom:1px solid #e8eaf0;";
  return `
    <tr>
      <td style="${border}border-left:3px solid ${BRAND_CYAN};padding:16px 20px 16px 17px;">
        <span style="display:block;font-size:10px;color:#9ca3af;text-transform:uppercase;
                     letter-spacing:0.6px;font-weight:600;margin-bottom:5px;
                     font-family:${FONT_BODY};">${label}</span>
        <span style="display:block;font-size:16px;font-weight:700;color:#111827;
                     line-height:1.3;font-family:${FONT_BODY};">${value}</span>
      </td>
    </tr>`;
}

/** Full-width rounded CTA button */
function ctaButton(label: string, url: string): string {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 0;">
      <tr>
        <td>
          <a href="${url}"
             style="display:block;width:100%;box-sizing:border-box;
                    background:${BRAND_NAVY};color:#ffffff;
                    font-size:15px;font-weight:700;letter-spacing:0.2px;
                    text-decoration:none;text-align:center;
                    padding:16px 24px;border-radius:10px;
                    font-family:${FONT_BODY};">
            ${label}
          </a>
        </td>
      </tr>
    </table>`;
}

/** Contact info box used in public-facing emails */
function contactBlock(): string {
  return `
    <p style="margin:0 0 6px;font-size:13px;color:#6b7280;font-family:${FONT_BODY};">
      Apabila Anda memiliki pertanyaan, silakan menghubungi kami melalui:
    </p>
    <p style="margin:0;font-size:13px;color:#374151;line-height:2;font-family:${FONT_BODY};">
      <strong>Email:</strong>&nbsp;
      <a href="mailto:${CONTACT_EMAIL}" style="color:${BRAND_CYAN};text-decoration:none;">${CONTACT_EMAIL}</a><br/>
      <strong>Telepon:</strong>&nbsp;${CONTACT_PHONE}
    </p>`;
}

/** Closing signature */
function signatureBlock(): string {
  return `
    <p style="margin:0 0 2px;font-size:13px;color:#6b7280;font-family:${FONT_BODY};">Hormat kami,</p>
    <p style="margin:0;font-size:13px;color:${BRAND_NAVY};font-weight:700;line-height:1.6;font-family:${FONT_BODY};">
      Badan Kepegawaian dan Pengembangan Sumber Daya Manusia<br/>
      Kabupaten Kepulauan Anambas
    </p>`;
}

/** Thin horizontal divider */
function divider(): string {
  return `<div style="border-top:1px solid #e8eaf0;margin:32px 0 28px;line-height:0;font-size:0;"></div>`;
}

// ---------------------------------------------------------------------------
// Shared wrapper
// ---------------------------------------------------------------------------

function wrap(bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:${FONT_BODY};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="680" cellpadding="0" cellspacing="0"
               style="max-width:680px;width:100%;background:#ffffff;border-radius:12px;
                      overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.10);">

          <!-- Yellow accent bar -->
          <tr>
            <td style="background:${BRAND_YELLOW};height:4px;line-height:4px;font-size:0;">&nbsp;</td>
          </tr>

          <!-- Header: white bg so both logos are fully visible -->
          <tr>
            <td style="background:#ffffff;padding:20px 28px;border-bottom:4px solid ${BRAND_NAVY};">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="60" valign="middle">
                    <img src="${APP_URL}/logo-anambas.png" height="52" width="52"
                         alt="Lambang Kabupaten Kepulauan Anambas"
                         style="display:block;border:0;height:52px;width:auto;" />
                  </td>
                  <td valign="middle" style="padding:0 16px;">
                    <div style="color:${BRAND_NAVY};font-family:${FONT_BODY};font-size:13px;
                                font-weight:700;line-height:1.4;">
                      Badan Kepegawaian dan Pengembangan Sumber Daya Manusia
                    </div>
                    <div style="color:${BRAND_CYAN};font-family:${FONT_BODY};font-size:11px;
                                font-weight:600;letter-spacing:0.8px;margin-top:3px;">
                      Kabupaten Kepulauan Anambas
                    </div>
                  </td>
                  <td width="60" valign="middle" align="right">
                    <img src="${APP_URL}/logo-bkpsdm.png" height="52" width="52"
                         alt="Logo BKPSDM"
                         style="display:block;border:0;height:52px;width:auto;margin-left:auto;" />
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 36px;font-family:${FONT_BODY};">
              ${bodyContent}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8f9fb;padding:20px 36px;border-top:1px solid #e8eaf0;">
              <p style="margin:0 0 4px;font-size:11px;color:#9ca3af;text-align:center;
                        line-height:1.7;font-family:${FONT_BODY};">
                Email ini dikirim secara otomatis oleh sistem pengaduan<br/>
                Badan Kepegawaian dan Pengembangan Sumber Daya Manusia Kabupaten Kepulauan Anambas.
              </p>
              <p style="margin:8px 0 0;font-size:11px;color:#9ca3af;text-align:center;font-family:${FONT_BODY};">
                Mohon tidak membalas email ini.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// 1. Login Security Alert → sent to ADMIN_EMAIL on every successful login
// ---------------------------------------------------------------------------

export function loginAlertTemplate(opts: {
  username: string;
  timestamp: string;
  ip?: string;
}): { subject: string; html: string } {
  const subject = "[SKM] Login Admin Berhasil";
  const html = wrap(`
    <h2 style="margin:0 0 8px;font-size:22px;font-family:${FONT_HEADING};
               color:${BRAND_NAVY};letter-spacing:-0.3px;">
      Login Admin Terdeteksi
    </h2>
    <p style="margin:0 0 28px;font-size:14px;color:#6b7280;line-height:1.7;font-family:${FONT_BODY};">
      Telah terjadi login berhasil ke panel admin Survei Kepuasan Masyarakat.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0"
           style="background:#f8f9fb;border-radius:10px;border:1px solid #e8eaf0;
                  margin-bottom:28px;overflow:hidden;">
      ${infoRow("Username", opts.username)}
      ${infoRow("Waktu Login (WIB)", opts.timestamp)}
      ${infoRow("Alamat IP",
        `<span style="font-family:monospace;">${opts.ip ?? "tidak diketahui"}</span>`, true)}
    </table>

    <div style="background:#fefce8;border:1.5px solid #fde047;border-radius:8px;padding:16px 20px;">
      <p style="margin:0;font-size:13px;color:#854d0e;line-height:1.7;font-family:${FONT_BODY};">
        <strong>Bukan Anda?</strong> Jika Anda tidak melakukan login ini, segera ubah kata sandi
        admin dan hubungi pengelola sistem.
      </p>
    </div>
  `);
  return { subject, html };
}

// ---------------------------------------------------------------------------
// 2. Unblock Request Notification → sent to ADMIN_EMAIL when user submits appeal
// ---------------------------------------------------------------------------

export function unblockRequestTemplate(opts: {
  ip: string;
  message: string;
  userEmail?: string;
  requestedAt: string;
}): { subject: string; html: string } {
  const subject = `[SKM] Permintaan Buka Blokir IP: ${opts.ip}`;
  const html = wrap(`
    <h2 style="margin:0 0 8px;font-size:22px;font-family:${FONT_HEADING};
               color:${BRAND_NAVY};letter-spacing:-0.3px;">
      Permintaan Buka Blokir Diterima
    </h2>
    <p style="margin:0 0 28px;font-size:14px;color:#6b7280;line-height:1.7;font-family:${FONT_BODY};">
      Seorang pengguna telah mengirimkan permintaan untuk membuka blokir alamat IP-nya.
      Silakan tinjau dan proses melalui dasbor manajemen IP.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0"
           style="background:#f8f9fb;border-radius:10px;border:1px solid #e8eaf0;
                  margin-bottom:28px;overflow:hidden;">
      ${infoRow("Alamat IP",
        `<span style="font-family:monospace;">${opts.ip}</span>`)}
      ${infoRow("Email Pengguna",
        opts.userEmail ?? "<em style='color:#9ca3af;font-weight:400;'>tidak disertakan</em>")}
      ${infoRow("Waktu Permintaan (WIB)", opts.requestedAt)}
      <tr>
        <td style="border-left:3px solid ${BRAND_CYAN};padding:16px 20px 16px 17px;">
          <span style="display:block;font-size:10px;color:#9ca3af;text-transform:uppercase;
                       letter-spacing:0.6px;font-weight:600;margin-bottom:8px;
                       font-family:${FONT_BODY};">Pesan dari Pengguna</span>
          <div style="font-size:14px;color:#374151;line-height:1.7;
                      background:#ffffff;border:1px solid #e8eaf0;border-radius:6px;
                      padding:12px 14px;white-space:pre-wrap;
                      font-family:${FONT_BODY};">${opts.message}</div>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.7;font-family:${FONT_BODY};">
      Untuk memproses permintaan ini, buka <strong>Dasbor Admin → Manajemen IP</strong>
      dan cari alamat IP di atas.
    </p>
  `);
  return { subject, html };
}

// ---------------------------------------------------------------------------
// 3. Unblock Approved Confirmation → sent to the user's email when admin unblocks
// ---------------------------------------------------------------------------

export function unblockApprovedTemplate(opts: {
  ip: string;
  approvedAt: string;
}): { subject: string; html: string } {
  const subject = "[SKM] Permintaan Buka Blokir Disetujui";
  const html = wrap(`
    <h2 style="margin:0 0 8px;font-size:22px;font-family:${FONT_HEADING};
               color:${BRAND_NAVY};letter-spacing:-0.3px;">
      Permintaan Anda Telah Disetujui
    </h2>
    <p style="margin:0 0 28px;font-size:14px;color:#6b7280;line-height:1.7;font-family:${FONT_BODY};">
      Permintaan Anda untuk membuka blokir telah diproses dan disetujui oleh tim admin
      Badan Kepegawaian dan Pengembangan Sumber Daya Manusia Kabupaten Kepulauan Anambas.
    </p>

    <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:8px;
                padding:20px 24px;margin-bottom:28px;">
      <p style="margin:0 0 8px;font-size:14px;color:#166534;font-weight:600;font-family:${FONT_BODY};">
        ✓ Akses Anda telah dipulihkan
      </p>
      <p style="margin:0;font-size:13px;color:#15803d;line-height:1.7;font-family:${FONT_BODY};">
        Anda sekarang dapat mengakses formulir Survei Kepuasan Masyarakat kembali.
      </p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0"
           style="background:#f8f9fb;border-radius:10px;border:1px solid #e8eaf0;
                  margin-bottom:28px;overflow:hidden;">
      ${infoRow("Alamat IP yang Dibuka",
        `<span style="font-family:monospace;">${opts.ip}</span>`)}
      ${infoRow("Disetujui pada (WIB)", opts.approvedAt, true)}
    </table>

    <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.7;font-family:${FONT_BODY};">
      Terima kasih atas kesabaran Anda. Jika masih mengalami kendala akses,
      silakan hubungi petugas Badan Kepegawaian dan Pengembangan Sumber Daya Manusia
      Kabupaten Kepulauan Anambas.
    </p>
  `);
  return { subject, html };
}

// ---------------------------------------------------------------------------
// 4. Pengaduan Masyarakat — Confirmation to complainant
// ---------------------------------------------------------------------------

export function pengaduanConfirmTemplate(opts: {
  nama: string;
  judul: string;
  nomorUrut: number;
  createdAt: string;
}): { subject: string; html: string } {
  const subject = "[BKPSDM] Pengaduan Anda Telah Diterima";
  const html = wrap(`
    <!-- Formal greeting -->
    <p style="margin:0 0 4px;font-size:15px;color:#374151;font-family:${FONT_BODY};">
      Yth. Bapak/Ibu <strong>${opts.nama}</strong>,
    </p>
    <p style="margin:0 0 28px;font-size:14px;color:#6b7280;line-height:1.75;font-family:${FONT_BODY};">
      Terima kasih telah menyampaikan pengaduan kepada Badan Kepegawaian dan Pengembangan
      Sumber Daya Manusia Kabupaten Kepulauan Anambas. Pengaduan Anda telah kami terima
      dan akan segera ditindaklanjuti oleh tim kami.
    </p>

    <!-- Info block -->
    <table width="100%" cellpadding="0" cellspacing="0"
           style="background:#f8f9fb;border-radius:10px;border:1px solid #e8eaf0;
                  overflow:hidden;margin-bottom:28px;">
      ${infoRow("Judul Pengaduan", opts.judul)}
      ${infoRow("Nomor Tiket", formatTicket(opts.nomorUrut, opts.createdAt))}
      ${infoRow("Tanggal Pengajuan", formatDate(opts.createdAt))}
      <tr>
        <td style="border-left:3px solid ${BRAND_CYAN};padding:16px 20px 16px 17px;">
          <span style="display:block;font-size:10px;color:#9ca3af;text-transform:uppercase;
                       letter-spacing:0.6px;font-weight:600;margin-bottom:8px;
                       font-family:${FONT_BODY};">Status Saat Ini</span>
          <span style="display:inline-block;padding:6px 16px;background:#f0fdf4;
                       color:#16a34a;font-size:13px;font-weight:700;
                       border-radius:6px;font-family:${FONT_BODY};">
            Diterima
          </span>
        </td>
      </tr>
    </table>

    <!-- Info paragraph -->
    <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.75;font-family:${FONT_BODY};">
      Tim kami akan memproses pengaduan ini sesuai prosedur yang berlaku.
      Kami akan menghubungi Anda apabila diperlukan informasi tambahan atau ketika terdapat
      pembaruan lebih lanjut.
    </p>
    <p style="margin:0 0 0;font-size:14px;color:#374151;line-height:1.75;font-family:${FONT_BODY};">
      Simpan nomor tiket Anda untuk memudahkan pelacakan status pengaduan.
    </p>

    <!-- CTA -->
    ${ctaButton("Pantau Status Pengaduan", `${APP_URL}/pengaduan`)}

    ${divider()}

    <!-- Contact -->
    ${contactBlock()}

    <div style="margin-top:28px;">
      ${signatureBlock()}
    </div>
  `);
  return { subject, html };
}

// ---------------------------------------------------------------------------
// 5. Pengaduan Masyarakat — Notification to admin
// ---------------------------------------------------------------------------

export function pengaduanNotifTemplate(opts: {
  nama: string;
  email: string;
  telepon?: string;
  judul: string;
  isi: string;
}): { subject: string; html: string } {
  const subject = `[BKPSDM] Pengaduan Baru: ${opts.judul}`;
  const html = wrap(`
    <h2 style="margin:0 0 8px;font-size:22px;font-family:${FONT_HEADING};
               color:${BRAND_NAVY};letter-spacing:-0.3px;">
      Pengaduan Masyarakat Baru
    </h2>
    <p style="margin:0 0 28px;font-size:14px;color:#6b7280;line-height:1.75;font-family:${FONT_BODY};">
      Telah masuk pengaduan baru dari masyarakat. Silakan tinjau dan proses melalui dasbor admin.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0"
           style="background:#f8f9fb;border-radius:10px;border:1px solid #e8eaf0;
                  margin-bottom:28px;overflow:hidden;">
      ${infoRow("Nama Pelapor", opts.nama)}
      ${infoRow("Email", opts.email)}
      ${infoRow("Nomor Telepon",
        opts.telepon ?? "<em style='color:#9ca3af;font-weight:400;'>tidak disertakan</em>")}
      ${infoRow("Judul Pengaduan", opts.judul)}
      <tr>
        <td style="border-left:3px solid ${BRAND_CYAN};padding:16px 20px 16px 17px;">
          <span style="display:block;font-size:10px;color:#9ca3af;text-transform:uppercase;
                       letter-spacing:0.6px;font-weight:600;margin-bottom:8px;
                       font-family:${FONT_BODY};">Isi Pengaduan</span>
          <div style="font-size:14px;color:#374151;line-height:1.7;
                      background:#ffffff;border:1px solid #e8eaf0;border-radius:6px;
                      padding:12px 14px;white-space:pre-wrap;
                      font-family:${FONT_BODY};">${opts.isi}</div>
        </td>
      </tr>
    </table>

    ${ctaButton("Buka Dasbor Admin → Pengaduan", `${APP_URL}/admin/pengaduan`)}
  `);
  return { subject, html };
}

// ---------------------------------------------------------------------------
// 6. Pengaduan Status Update → sent to complainant when admin changes status
// ---------------------------------------------------------------------------

export function pengaduanStatusUpdateTemplate(opts: {
  nama: string;
  judul: string;
  status: "DIPROSES" | "PERLU_DATA" | "SELESAI" | "DITOLAK";
  nomorUrut: number;
  createdAt: string;
}): { subject: string; html: string } {

  const subjectMap: Record<string, string> = {
    DIPROSES:   "[BKPSDM] Pengaduan Anda Sedang Diproses",
    PERLU_DATA: "[BKPSDM] Informasi Tambahan Dibutuhkan",
    SELESAI:    "[BKPSDM] Pengaduan Anda Telah Selesai",
    DITOLAK:    "[BKPSDM] Pengaduan Tidak Dapat Diproses",
  };

  const badgeMap: Record<string, { label: string; color: string; bg: string }> = {
    DIPROSES:   { label: "Sedang Diproses",     color: BRAND_CYAN,  bg: "#e0f4fa" },
    PERLU_DATA: { label: "Perlu Data Tambahan", color: "#7c3aed",   bg: "#f5f3ff" },
    SELESAI:    { label: "Selesai Ditangani",   color: "#16a34a",   bg: "#dcfce7" },
    DITOLAK:    { label: "Tidak Dapat Diproses",color: "#dc2626",   bg: "#fef2f2" },
  };

  const messageMap: Record<string, string> = {
    DIPROSES: `
    <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.75;font-family:${FONT_BODY};">
      Pengaduan Anda saat ini sedang ditindaklanjuti oleh tim kami. Proses verifikasi
      dan penanganan sedang berlangsung sesuai dengan prosedur yang berlaku.
    </p>
    <p style="margin:0;font-size:14px;color:#374151;line-height:1.75;font-family:${FONT_BODY};">
      Kami akan menghubungi Anda apabila diperlukan informasi tambahan atau ketika
      terdapat pembaruan lebih lanjut.
    </p>`,
    PERLU_DATA: `
    <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.75;font-family:${FONT_BODY};">
      Tim kami memerlukan informasi atau dokumen tambahan untuk dapat memproses
      pengaduan Anda lebih lanjut.
    </p>
    <p style="margin:0;font-size:14px;color:#374151;line-height:1.75;font-family:${FONT_BODY};">
      Mohon hubungi kami melalui email atau telepon di bawah untuk menyampaikan
      informasi yang diperlukan.
    </p>`,
    SELESAI: `
    <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.75;font-family:${FONT_BODY};">
      Pengaduan Anda telah selesai ditangani oleh tim Badan Kepegawaian dan Pengembangan
      Sumber Daya Manusia Kabupaten Kepulauan Anambas.
    </p>
    <p style="margin:0;font-size:14px;color:#374151;line-height:1.75;font-family:${FONT_BODY};">
      Terima kasih atas kepercayaan dan partisipasi Anda demi peningkatan kualitas
      pelayanan publik.
    </p>`,
    DITOLAK: `
    <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.75;font-family:${FONT_BODY};">
      Mohon maaf, pengaduan Anda tidak dapat kami proses lebih lanjut. Hal ini
      dapat disebabkan oleh kurangnya informasi pendukung atau pengaduan di luar
      kewenangan kami.
    </p>
    <p style="margin:0;font-size:14px;color:#374151;line-height:1.75;font-family:${FONT_BODY};">
      Apabila Anda memiliki pertanyaan mengenai keputusan ini, silakan hubungi kami
      melalui kontak di bawah.
    </p>`,
  };

  const badge = badgeMap[opts.status] ?? badgeMap.DIPROSES;
  const subject = subjectMap[opts.status] ?? subjectMap.DIPROSES;
  const message = messageMap[opts.status] ?? messageMap.DIPROSES;

  const html = wrap(`
    <!-- Formal greeting -->
    <p style="margin:0 0 4px;font-size:15px;color:#374151;font-family:${FONT_BODY};">
      Yth. Bapak/Ibu <strong>${opts.nama}</strong>,
    </p>
    <p style="margin:0 0 28px;font-size:14px;color:#6b7280;line-height:1.75;font-family:${FONT_BODY};">
      Terima kasih telah menyampaikan pengaduan kepada Badan Kepegawaian dan Pengembangan
      Sumber Daya Manusia Kabupaten Kepulauan Anambas. Berikut adalah pembaruan status
      pengaduan Anda:
    </p>

    <!-- Info block -->
    <table width="100%" cellpadding="0" cellspacing="0"
           style="background:#f8f9fb;border-radius:10px;border:1px solid #e8eaf0;
                  overflow:hidden;margin-bottom:28px;">
      ${infoRow("Judul Pengaduan", opts.judul)}
      ${infoRow("Nomor Tiket", formatTicket(opts.nomorUrut, opts.createdAt))}
      ${infoRow("Tanggal Pengajuan", formatDate(opts.createdAt))}
      <tr>
        <td style="border-left:3px solid ${BRAND_CYAN};padding:16px 20px 16px 17px;">
          <span style="display:block;font-size:10px;color:#9ca3af;text-transform:uppercase;
                       letter-spacing:0.6px;font-weight:600;margin-bottom:8px;
                       font-family:${FONT_BODY};">Status Saat Ini</span>
          <span style="display:inline-block;padding:6px 16px;background:${badge.bg};
                       color:${badge.color};font-size:13px;font-weight:700;
                       border-radius:6px;font-family:${FONT_BODY};">
            ${badge.label}
          </span>
        </td>
      </tr>
    </table>

    ${message}

    <!-- CTA -->
    ${ctaButton("Pantau Status Pengaduan", `${APP_URL}/pengaduan`)}

    ${divider()}

    <!-- Contact -->
    ${contactBlock()}

    <div style="margin-top:28px;">
      ${signatureBlock()}
    </div>
  `);

  return { subject, html };
}

// ---------------------------------------------------------------------------
// 7. Survey Submission Confirmation → sent to respondent
// ---------------------------------------------------------------------------

export function surveyConfirmationTemplate(opts: {
  nama: string;
  layananNama: string;
  tglLayanan: string;
  periodeLabel: string;
}): { subject: string; html: string } {
  const subject = "[SKM] Terima Kasih atas Partisipasi Survei Anda";
  const html = wrap(`
    <h2 style="margin:0 0 8px;font-size:22px;font-family:${FONT_HEADING};
               color:${BRAND_NAVY};letter-spacing:-0.3px;">
      Survei Berhasil Dikirim
    </h2>
    <p style="margin:0 0 28px;font-size:14px;color:#6b7280;line-height:1.75;font-family:${FONT_BODY};">
      Terima kasih, <strong>${opts.nama}</strong>! Survei Kepuasan Masyarakat Anda telah
      berhasil diterima dan dicatat oleh sistem.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0"
           style="background:#f8f9fb;border-radius:10px;border:1px solid #e8eaf0;
                  margin-bottom:28px;overflow:hidden;">
      ${infoRow("Layanan yang Dinilai", opts.layananNama)}
      ${infoRow("Tanggal Layanan", opts.tglLayanan)}
      ${infoRow("Periode Survei", opts.periodeLabel, true)}
    </table>

    <div style="background:#fefce8;border:1.5px solid #fde047;border-radius:8px;
                padding:16px 20px;">
      <p style="margin:0;font-size:13px;color:#854d0e;line-height:1.7;font-family:${FONT_BODY};">
        Pendapat Anda sangat berarti untuk meningkatkan kualitas pelayanan publik
        Badan Kepegawaian dan Pengembangan Sumber Daya Manusia Kabupaten Kepulauan Anambas.
        Terima kasih atas partisipasi Anda.
      </p>
    </div>
  `);
  return { subject, html };
}
