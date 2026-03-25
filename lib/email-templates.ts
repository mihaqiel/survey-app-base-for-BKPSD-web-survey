/**
 * Pure HTML email template functions.
 * No imports, no side effects — each returns { subject, html }.
 * All templates use inline CSS for maximum email client compatibility.
 */

const BRAND_NAVY   = "#0d2d58";
const BRAND_CYAN   = "#009CC5";
const BRAND_YELLOW = "#FAE705";
const APP_URL      = process.env.NEXT_PUBLIC_APP_URL ?? "https://clever-varahamihira.vercel.app";

// DM Sans is loaded via <link> (works in Gmail/Apple Mail) with system-font fallbacks
// for Outlook and clients that block external CSS.
const FONT_BODY    = "'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif";
// Playfair Display cannot be reliably loaded in email — Georgia is the closest serif fallback.
const FONT_HEADING = "Georgia,'Times New Roman',serif";

/** Shared wrapper HTML for all emails */
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
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.10);">

          <!-- Yellow accent bar -->
          <tr>
            <td style="background:${BRAND_YELLOW};height:4px;line-height:4px;font-size:0;">&nbsp;</td>
          </tr>

          <!-- Header: navy band with dual logos -->
          <tr>
            <td style="background:${BRAND_NAVY};padding:20px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <!-- Logo kiri: Lambang Anambas -->
                  <td width="56" valign="middle">
                    <img src="${APP_URL}/logo-anambas.png" height="48" width="48"
                         alt="Lambang Kabupaten Kepulauan Anambas"
                         style="display:block;border:0;height:48px;width:auto;object-fit:contain;" />
                  </td>

                  <!-- Nama instansi (tengah) -->
                  <td valign="middle" style="padding:0 16px;">
                    <div style="color:#ffffff;font-family:${FONT_BODY};font-size:13px;font-weight:700;line-height:1.35;letter-spacing:0.1px;">
                      Badan Kepegawaian dan Pengembangan Sumber Daya Manusia
                    </div>
                    <div style="color:${BRAND_YELLOW};font-family:${FONT_BODY};font-size:11px;font-weight:500;letter-spacing:0.8px;margin-top:3px;">
                      Kabupaten Kepulauan Anambas
                    </div>
                  </td>

                  <!-- Logo kanan: BKPSDM -->
                  <td width="56" valign="middle" align="right">
                    <img src="${APP_URL}/logo-bkpsdm.png" height="48" width="48"
                         alt="Logo BKPSDM"
                         style="display:block;border:0;height:48px;width:auto;object-fit:contain;margin-left:auto;" />
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;font-family:${FONT_BODY};">
              ${bodyContent}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8f9fb;padding:20px 32px;border-top:1px solid #e8eaf0;">
              <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;line-height:1.7;font-family:${FONT_BODY};">
                Email ini dikirim secara otomatis oleh sistem Survei Kepuasan Masyarakat<br/>
                Badan Kepegawaian dan Pengembangan Sumber Daya Manusia Kabupaten Kepulauan Anambas.<br/>
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

/** Reusable info-table row — cyan left-border anchors the blue accent */
function infoRow(label: string, value: string, isLast = false): string {
  const border = isLast ? "" : "border-bottom:1px solid #e8eaf0;";
  return `
    <tr>
      <td style="${border}border-left:3px solid ${BRAND_CYAN};padding:14px 20px 14px 17px;">
        <span style="font-size:11px;color:#9ca3af;display:block;margin-bottom:3px;font-family:${FONT_BODY};letter-spacing:0.3px;text-transform:uppercase;">${label}</span>
        <span style="font-size:14px;font-weight:600;color:#111827;font-family:${FONT_BODY};">${value}</span>
      </td>
    </tr>`;
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
    <h2 style="margin:0 0 8px;font-size:22px;font-family:${FONT_HEADING};color:${BRAND_NAVY};letter-spacing:-0.3px;">
      Login Admin Terdeteksi
    </h2>
    <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.7;font-family:${FONT_BODY};">
      Telah terjadi login berhasil ke panel admin Survei Kepuasan Masyarakat.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fb;border-radius:8px;border:1px solid #e8eaf0;margin-bottom:24px;overflow:hidden;">
      ${infoRow("Username", opts.username)}
      ${infoRow("Waktu Login (WIB)", opts.timestamp)}
      ${infoRow("Alamat IP", `<span style="font-family:monospace;">${opts.ip ?? "tidak diketahui"}</span>`, true)}
    </table>

    <div style="background:#fefce8;border:1.5px solid #fde047;border-radius:8px;padding:16px 20px;">
      <p style="margin:0;font-size:13px;color:#854d0e;line-height:1.7;font-family:${FONT_BODY};">
        <strong>Bukan Anda?</strong> Jika Anda tidak melakukan login ini, segera ubah kata sandi admin
        dan hubungi pengelola sistem.
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
    <h2 style="margin:0 0 8px;font-size:22px;font-family:${FONT_HEADING};color:${BRAND_NAVY};letter-spacing:-0.3px;">
      Permintaan Buka Blokir Diterima
    </h2>
    <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.7;font-family:${FONT_BODY};">
      Seorang pengguna telah mengirimkan permintaan untuk membuka blokir alamat IP-nya di sistem
      Survei Kepuasan Masyarakat. Silakan tinjau dan proses melalui dasbor manajemen IP.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fb;border-radius:8px;border:1px solid #e8eaf0;margin-bottom:24px;overflow:hidden;">
      ${infoRow("Alamat IP", `<span style="font-family:monospace;">${opts.ip}</span>`)}
      ${infoRow("Email Pengguna", opts.userEmail ?? "<em style='color:#9ca3af;font-weight:400;'>tidak disertakan</em>")}
      ${infoRow("Waktu Permintaan (WIB)", opts.requestedAt)}
      <tr>
        <td style="border-left:3px solid ${BRAND_CYAN};padding:14px 20px 14px 17px;">
          <span style="font-size:11px;color:#9ca3af;display:block;margin-bottom:6px;font-family:${FONT_BODY};letter-spacing:0.3px;text-transform:uppercase;">Pesan dari Pengguna</span>
          <div style="font-size:14px;color:#374151;line-height:1.7;background:#ffffff;border:1px solid #e8eaf0;border-radius:6px;padding:12px 14px;white-space:pre-wrap;font-family:${FONT_BODY};">${opts.message}</div>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.7;font-family:${FONT_BODY};">
      Untuk memproses permintaan ini, buka <strong>Dasbor Admin → Manajemen IP</strong> dan cari alamat IP di atas.
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
    <h2 style="margin:0 0 8px;font-size:22px;font-family:${FONT_HEADING};color:${BRAND_NAVY};letter-spacing:-0.3px;">
      Permintaan Anda Telah Disetujui
    </h2>
    <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.7;font-family:${FONT_BODY};">
      Permintaan Anda untuk membuka blokir telah diproses dan disetujui oleh tim admin
      Badan Kepegawaian dan Pengembangan Sumber Daya Manusia Kabupaten Kepulauan Anambas.
    </p>

    <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:8px;padding:20px 24px;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-size:14px;color:#166534;font-weight:600;font-family:${FONT_BODY};">
        ✓ Akses Anda telah dipulihkan
      </p>
      <p style="margin:0;font-size:13px;color:#15803d;line-height:1.7;font-family:${FONT_BODY};">
        Anda sekarang dapat mengakses formulir Survei Kepuasan Masyarakat kembali.
      </p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fb;border-radius:8px;border:1px solid #e8eaf0;margin-bottom:24px;overflow:hidden;">
      ${infoRow("Alamat IP yang Dibuka", `<span style="font-family:monospace;">${opts.ip}</span>`)}
      ${infoRow("Disetujui pada (WIB)", opts.approvedAt, true)}
    </table>

    <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.7;font-family:${FONT_BODY};">
      Terima kasih atas kesabaran Anda. Jika masih mengalami kendala akses,
      silakan hubungi petugas Badan Kepegawaian dan Pengembangan Sumber Daya Manusia Kabupaten Kepulauan Anambas.
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
}): { subject: string; html: string } {
  const subject = "[BKPSDM] Pengaduan Anda Telah Diterima";
  const html = wrap(`
    <h2 style="margin:0 0 8px;font-size:22px;font-family:${FONT_HEADING};color:${BRAND_NAVY};letter-spacing:-0.3px;">
      Pengaduan Berhasil Dikirim
    </h2>
    <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.7;font-family:${FONT_BODY};">
      Terima kasih, <strong>${opts.nama}</strong>. Pengaduan Anda telah kami terima dan akan segera
      ditindaklanjuti oleh tim Badan Kepegawaian dan Pengembangan Sumber Daya Manusia Kabupaten Kepulauan Anambas.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fb;border-radius:8px;border:1px solid #e8eaf0;margin-bottom:24px;overflow:hidden;">
      ${infoRow("Judul Pengaduan", opts.judul, true)}
    </table>

    <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:8px;padding:16px 20px;">
      <p style="margin:0;font-size:13px;color:#166534;line-height:1.7;font-family:${FONT_BODY};">
        Tim kami akan memproses pengaduan ini dan menghubungi Anda jika diperlukan informasi tambahan.
        Terima kasih atas kepercayaan Anda kepada Badan Kepegawaian dan Pengembangan Sumber Daya Manusia
        Kabupaten Kepulauan Anambas.
      </p>
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
    <h2 style="margin:0 0 8px;font-size:22px;font-family:${FONT_HEADING};color:${BRAND_NAVY};letter-spacing:-0.3px;">
      Pengaduan Masyarakat Baru
    </h2>
    <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.7;font-family:${FONT_BODY};">
      Telah masuk pengaduan baru dari masyarakat. Silakan tinjau dan proses melalui dasbor admin.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fb;border-radius:8px;border:1px solid #e8eaf0;margin-bottom:24px;overflow:hidden;">
      ${infoRow("Nama Pelapor", opts.nama)}
      ${infoRow("Email", opts.email)}
      ${infoRow("Nomor Telepon", opts.telepon ?? "<em style='color:#9ca3af;font-weight:400;'>tidak disertakan</em>")}
      ${infoRow("Judul Pengaduan", opts.judul)}
      <tr>
        <td style="border-left:3px solid ${BRAND_CYAN};padding:14px 20px 14px 17px;">
          <span style="font-size:11px;color:#9ca3af;display:block;margin-bottom:6px;font-family:${FONT_BODY};letter-spacing:0.3px;text-transform:uppercase;">Isi Pengaduan</span>
          <div style="font-size:14px;color:#374151;line-height:1.7;background:#ffffff;border:1px solid #e8eaf0;border-radius:6px;padding:12px 14px;white-space:pre-wrap;font-family:${FONT_BODY};">${opts.isi}</div>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.7;font-family:${FONT_BODY};">
      Untuk memproses pengaduan ini, buka <strong>Dasbor Admin → Pengaduan</strong>.
    </p>
  `);
  return { subject, html };
}

// ---------------------------------------------------------------------------
// 6. Pengaduan Status Update → sent to complainant when admin changes status
// ---------------------------------------------------------------------------

export function pengaduanStatusUpdateTemplate(opts: {
  nama: string;
  judul: string;
  status: "DIPROSES" | "SELESAI";
}): { subject: string; html: string } {
  const isDiproses = opts.status === "DIPROSES";

  const subject = isDiproses
    ? "[BKPSDM] Pengaduan Anda Sedang Diproses"
    : "[BKPSDM] Pengaduan Anda Telah Selesai";

  const badgeColor    = isDiproses ? BRAND_CYAN   : "#16a34a";
  const badgeBg       = isDiproses ? "#e0f4fa"    : "#f0fdf4";
  const badgeLabel    = isDiproses ? "Sedang Diproses" : "Selesai Ditangani";
  const calloutBg     = isDiproses ? "#e0f4fa"    : "#f0fdf4";
  const calloutBorder = isDiproses ? BRAND_CYAN   : "#86efac";
  const calloutText   = isDiproses ? "#00627d"    : "#166534";

  const message = isDiproses
    ? "Pengaduan Anda sedang ditindaklanjuti oleh tim Badan Kepegawaian dan Pengembangan Sumber Daya Manusia. Kami akan menghubungi Anda jika diperlukan informasi tambahan."
    : "Pengaduan Anda telah selesai ditangani oleh tim Badan Kepegawaian dan Pengembangan Sumber Daya Manusia Kabupaten Kepulauan Anambas. Terima kasih atas kepercayaan Anda.";

  const html = wrap(`
    <h2 style="margin:0 0 8px;font-size:22px;font-family:${FONT_HEADING};color:${BRAND_NAVY};letter-spacing:-0.3px;">
      Pembaruan Status Pengaduan
    </h2>
    <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.7;font-family:${FONT_BODY};">
      Halo, <strong>${opts.nama}</strong>. Berikut adalah pembaruan terbaru mengenai pengaduan yang Anda kirimkan.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fb;border-radius:8px;border:1px solid #e8eaf0;margin-bottom:24px;overflow:hidden;">
      ${infoRow("Judul Pengaduan", opts.judul)}
      <tr>
        <td style="border-left:3px solid ${BRAND_CYAN};padding:14px 20px 14px 17px;">
          <span style="font-size:11px;color:#9ca3af;display:block;margin-bottom:6px;font-family:${FONT_BODY};letter-spacing:0.3px;text-transform:uppercase;">Status Terkini</span>
          <span style="display:inline-block;padding:5px 14px;background:${badgeBg};color:${badgeColor};font-size:12px;font-weight:700;border-radius:4px;letter-spacing:0.5px;font-family:${FONT_BODY};">
            ${badgeLabel}
          </span>
        </td>
      </tr>
    </table>

    <div style="background:${calloutBg};border:1.5px solid ${calloutBorder};border-radius:8px;padding:16px 20px;">
      <p style="margin:0;font-size:13px;color:${calloutText};line-height:1.7;font-family:${FONT_BODY};">
        ${message}
      </p>
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
    <h2 style="margin:0 0 8px;font-size:22px;font-family:${FONT_HEADING};color:${BRAND_NAVY};letter-spacing:-0.3px;">
      Survei Berhasil Dikirim
    </h2>
    <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.7;font-family:${FONT_BODY};">
      Terima kasih, <strong>${opts.nama}</strong>! Survei Kepuasan Masyarakat Anda telah berhasil
      diterima dan dicatat oleh sistem.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fb;border-radius:8px;border:1px solid #e8eaf0;margin-bottom:24px;overflow:hidden;">
      ${infoRow("Layanan yang Dinilai", opts.layananNama)}
      ${infoRow("Tanggal Layanan", opts.tglLayanan)}
      ${infoRow("Periode Survei", opts.periodeLabel, true)}
    </table>

    <div style="background:#fefce8;border:1.5px solid #fde047;border-radius:8px;padding:16px 20px;">
      <p style="margin:0;font-size:13px;color:#854d0e;line-height:1.7;font-family:${FONT_BODY};">
        Pendapat Anda sangat berarti untuk meningkatkan kualitas pelayanan publik
        Badan Kepegawaian dan Pengembangan Sumber Daya Manusia Kabupaten Kepulauan Anambas.
        Terima kasih atas partisipasi Anda.
      </p>
    </div>
  `);
  return { subject, html };
}
