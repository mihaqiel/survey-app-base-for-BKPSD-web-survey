/**
 * Pure HTML email template functions.
 * No imports, no side effects — each returns { subject, html }.
 * All templates use inline CSS for maximum email client compatibility.
 */

const BRAND_NAVY = "#0d2d58";
const BRAND_YELLOW = "#FAE705";

/** Shared wrapper HTML for all emails */
function wrap(bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:${BRAND_NAVY};padding:24px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="color:#ffffff;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;opacity:0.7;margin-bottom:4px;">Sistem Survei Kepuasan Masyarakat</div>
                    <div style="color:#ffffff;font-size:17px;font-weight:700;line-height:1.3;">BKPSDM Kab. Kepulauan Anambas</div>
                  </td>
                  <td align="right">
                    <div style="width:36px;height:36px;background:${BRAND_YELLOW};border-radius:8px;display:inline-block;line-height:36px;text-align:center;font-size:18px;font-weight:900;color:${BRAND_NAVY};">S</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              ${bodyContent}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f8f9fb;padding:20px 32px;border-top:1px solid #e8eaf0;">
              <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;line-height:1.6;">
                Email ini dikirim secara otomatis oleh sistem SKM BKPSDM Kabupaten Kepulauan Anambas.<br/>
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
  const subject = "[SKM BKPSDM] Login Admin Berhasil";
  const html = wrap(`
    <h2 style="margin:0 0 8px;font-size:20px;color:${BRAND_NAVY};">Login Admin Terdeteksi</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6;">
      Telah terjadi login berhasil ke panel admin SKM BKPSDM.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fb;border-radius:8px;border:1px solid #e8eaf0;margin-bottom:24px;">
      <tr>
        <td style="padding:16px 20px;border-bottom:1px solid #e8eaf0;">
          <span style="font-size:12px;color:#9ca3af;display:block;margin-bottom:2px;">Username</span>
          <span style="font-size:14px;font-weight:600;color:#111827;">${opts.username}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 20px;border-bottom:1px solid #e8eaf0;">
          <span style="font-size:12px;color:#9ca3af;display:block;margin-bottom:2px;">Waktu Login (WIB)</span>
          <span style="font-size:14px;font-weight:600;color:#111827;">${opts.timestamp}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 20px;">
          <span style="font-size:12px;color:#9ca3af;display:block;margin-bottom:2px;">Alamat IP</span>
          <span style="font-size:14px;font-weight:600;color:#111827;font-family:monospace;">${opts.ip ?? "tidak diketahui"}</span>
        </td>
      </tr>
    </table>

    <div style="background:#fefce8;border:1.5px solid #fde047;border-radius:8px;padding:16px 20px;">
      <p style="margin:0;font-size:13px;color:#854d0e;line-height:1.6;">
        <strong>Bukan Anda?</strong> Jika Anda tidak melakukan login ini, segera ubah password admin
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
  const subject = `[SKM BKPSDM] Permintaan Buka Blokir IP: ${opts.ip}`;
  const html = wrap(`
    <h2 style="margin:0 0 8px;font-size:20px;color:${BRAND_NAVY};">Permintaan Buka Blokir Diterima</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6;">
      Seorang pengguna telah mengirimkan permintaan untuk membuka blokir IP-nya di sistem SKM.
      Silakan tinjau dan proses melalui panel manajemen IP.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fb;border-radius:8px;border:1px solid #e8eaf0;margin-bottom:24px;">
      <tr>
        <td style="padding:16px 20px;border-bottom:1px solid #e8eaf0;">
          <span style="font-size:12px;color:#9ca3af;display:block;margin-bottom:2px;">Alamat IP</span>
          <span style="font-size:14px;font-weight:600;color:#111827;font-family:monospace;">${opts.ip}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 20px;border-bottom:1px solid #e8eaf0;">
          <span style="font-size:12px;color:#9ca3af;display:block;margin-bottom:2px;">Email Pengguna</span>
          <span style="font-size:14px;font-weight:600;color:#111827;">${opts.userEmail ?? "<em style='color:#9ca3af;font-weight:400;'>tidak disertakan</em>"}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 20px;border-bottom:1px solid #e8eaf0;">
          <span style="font-size:12px;color:#9ca3af;display:block;margin-bottom:2px;">Waktu Permintaan (WIB)</span>
          <span style="font-size:14px;font-weight:600;color:#111827;">${opts.requestedAt}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 20px;">
          <span style="font-size:12px;color:#9ca3af;display:block;margin-bottom:6px;">Pesan dari Pengguna</span>
          <div style="font-size:14px;color:#374151;line-height:1.6;background:#ffffff;border:1px solid #e8eaf0;border-radius:6px;padding:12px 14px;white-space:pre-wrap;">${opts.message}</div>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6;">
      Untuk memproses permintaan ini, buka <strong>Panel Admin → Manajemen IP</strong> dan cari alamat IP di atas.
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
  const subject = "[SKM BKPSDM] Permintaan Buka Blokir Disetujui";
  const html = wrap(`
    <h2 style="margin:0 0 8px;font-size:20px;color:${BRAND_NAVY};">Permintaan Anda Telah Disetujui</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6;">
      Permintaan Anda untuk membuka blokir telah diproses dan disetujui oleh tim admin
      BKPSDM Kabupaten Kepulauan Anambas.
    </p>

    <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:8px;padding:20px 24px;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-size:14px;color:#166534;font-weight:600;">
        ✓ Akses Anda telah dipulihkan
      </p>
      <p style="margin:0;font-size:13px;color:#15803d;line-height:1.6;">
        Anda sekarang dapat mengakses formulir survei kepuasan masyarakat kembali.
      </p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fb;border-radius:8px;border:1px solid #e8eaf0;margin-bottom:24px;">
      <tr>
        <td style="padding:16px 20px;border-bottom:1px solid #e8eaf0;">
          <span style="font-size:12px;color:#9ca3af;display:block;margin-bottom:2px;">Alamat IP yang Dibuka</span>
          <span style="font-size:14px;font-weight:600;color:#111827;font-family:monospace;">${opts.ip}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 20px;">
          <span style="font-size:12px;color:#9ca3af;display:block;margin-bottom:2px;">Disetujui pada (WIB)</span>
          <span style="font-size:14px;font-weight:600;color:#111827;">${opts.approvedAt}</span>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6;">
      Terima kasih atas kesabaran Anda. Jika masih mengalami kendala akses,
      silakan hubungi petugas BKPSDM Kabupaten Kepulauan Anambas.
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
    <h2 style="margin:0 0 8px;font-size:20px;color:${BRAND_NAVY};">Pengaduan Berhasil Dikirim</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6;">
      Terima kasih, <strong>${opts.nama}</strong>. Pengaduan Anda telah kami terima dan akan segera ditindaklanjuti oleh tim BKPSDM Kabupaten Kepulauan Anambas.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fb;border-radius:8px;border:1px solid #e8eaf0;margin-bottom:24px;">
      <tr>
        <td style="padding:16px 20px;">
          <span style="font-size:12px;color:#9ca3af;display:block;margin-bottom:2px;">Judul Pengaduan</span>
          <span style="font-size:14px;font-weight:600;color:#111827;">${opts.judul}</span>
        </td>
      </tr>
    </table>

    <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:8px;padding:16px 20px;">
      <p style="margin:0;font-size:13px;color:#166534;line-height:1.6;">
        Tim kami akan memproses pengaduan ini dan menghubungi Anda jika diperlukan informasi tambahan.
        Terima kasih atas kepercayaan Anda kepada BKPSDM Kab. Kepulauan Anambas.
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
    <h2 style="margin:0 0 8px;font-size:20px;color:${BRAND_NAVY};">Pengaduan Masyarakat Baru</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6;">
      Telah masuk pengaduan baru dari masyarakat. Silakan tinjau dan proses melalui panel admin.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fb;border-radius:8px;border:1px solid #e8eaf0;margin-bottom:24px;">
      <tr>
        <td style="padding:16px 20px;border-bottom:1px solid #e8eaf0;">
          <span style="font-size:12px;color:#9ca3af;display:block;margin-bottom:2px;">Nama Pelapor</span>
          <span style="font-size:14px;font-weight:600;color:#111827;">${opts.nama}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 20px;border-bottom:1px solid #e8eaf0;">
          <span style="font-size:12px;color:#9ca3af;display:block;margin-bottom:2px;">Email</span>
          <span style="font-size:14px;font-weight:600;color:#111827;">${opts.email}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 20px;border-bottom:1px solid #e8eaf0;">
          <span style="font-size:12px;color:#9ca3af;display:block;margin-bottom:2px;">No. Telepon</span>
          <span style="font-size:14px;font-weight:600;color:#111827;">${opts.telepon ?? "<em style='color:#9ca3af;font-weight:400;'>tidak disertakan</em>"}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 20px;border-bottom:1px solid #e8eaf0;">
          <span style="font-size:12px;color:#9ca3af;display:block;margin-bottom:2px;">Judul Pengaduan</span>
          <span style="font-size:14px;font-weight:600;color:#111827;">${opts.judul}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 20px;">
          <span style="font-size:12px;color:#9ca3af;display:block;margin-bottom:6px;">Isi Pengaduan</span>
          <div style="font-size:14px;color:#374151;line-height:1.6;background:#ffffff;border:1px solid #e8eaf0;border-radius:6px;padding:12px 14px;white-space:pre-wrap;">${opts.isi}</div>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6;">
      Untuk memproses pengaduan ini, buka <strong>Panel Admin → Pengaduan</strong>.
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

  const badgeColor   = isDiproses ? "#009CC5" : "#16a34a";
  const badgeBg      = isDiproses ? "#e0f4fa" : "#f0fdf4";
  const badgeLabel   = isDiproses ? "Sedang Diproses" : "Selesai Ditangani";
  const calloutBg    = isDiproses ? "#e0f4fa" : "#f0fdf4";
  const calloutBorder= isDiproses ? "#009CC5" : "#86efac";
  const calloutText  = isDiproses ? "#00627d" : "#166534";

  const message = isDiproses
    ? "Pengaduan Anda sedang ditindaklanjuti oleh tim BKPSDM. Kami akan menghubungi Anda jika diperlukan informasi tambahan."
    : "Pengaduan Anda telah selesai ditangani oleh tim BKPSDM Kabupaten Kepulauan Anambas. Terima kasih atas kepercayaan Anda.";

  const html = wrap(`
    <h2 style="margin:0 0 8px;font-size:20px;color:${BRAND_NAVY};">Pembaruan Status Pengaduan</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6;">
      Halo, <strong>${opts.nama}</strong>. Berikut adalah pembaruan terbaru mengenai pengaduan yang Anda kirimkan.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fb;border-radius:8px;border:1px solid #e8eaf0;margin-bottom:24px;">
      <tr>
        <td style="padding:16px 20px;border-bottom:1px solid #e8eaf0;">
          <span style="font-size:12px;color:#9ca3af;display:block;margin-bottom:2px;">Judul Pengaduan</span>
          <span style="font-size:14px;font-weight:600;color:#111827;">${opts.judul}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 20px;">
          <span style="font-size:12px;color:#9ca3af;display:block;margin-bottom:6px;">Status Terkini</span>
          <span style="display:inline-block;padding:4px 12px;background:${badgeBg};color:${badgeColor};font-size:12px;font-weight:700;border-radius:4px;letter-spacing:0.5px;">
            ${badgeLabel}
          </span>
        </td>
      </tr>
    </table>

    <div style="background:${calloutBg};border:1.5px solid ${calloutBorder};border-radius:8px;padding:16px 20px;">
      <p style="margin:0;font-size:13px;color:${calloutText};line-height:1.6;">
        ${message}
      </p>
    </div>
  `);

  return { subject, html };
}

// ---------------------------------------------------------------------------
// 7. Survey Submission Confirmation → sent to respondent (optional, use case 4)
// ---------------------------------------------------------------------------

export function surveyConfirmationTemplate(opts: {
  nama: string;
  layananNama: string;
  tglLayanan: string;
  periodeLabel: string;
}): { subject: string; html: string } {
  const subject = "[SKM BKPSDM] Terima kasih atas partisipasi survei Anda";
  const html = wrap(`
    <h2 style="margin:0 0 8px;font-size:20px;color:${BRAND_NAVY};">Survei Berhasil Dikirim</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6;">
      Terima kasih, <strong>${opts.nama}</strong>! Survei kepuasan masyarakat Anda telah berhasil
      diterima dan dicatat oleh sistem.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fb;border-radius:8px;border:1px solid #e8eaf0;margin-bottom:24px;">
      <tr>
        <td style="padding:16px 20px;border-bottom:1px solid #e8eaf0;">
          <span style="font-size:12px;color:#9ca3af;display:block;margin-bottom:2px;">Layanan yang Dinilai</span>
          <span style="font-size:14px;font-weight:600;color:#111827;">${opts.layananNama}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 20px;border-bottom:1px solid #e8eaf0;">
          <span style="font-size:12px;color:#9ca3af;display:block;margin-bottom:2px;">Tanggal Layanan</span>
          <span style="font-size:14px;font-weight:600;color:#111827;">${opts.tglLayanan}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 20px;">
          <span style="font-size:12px;color:#9ca3af;display:block;margin-bottom:2px;">Periode Survei</span>
          <span style="font-size:14px;font-weight:600;color:#111827;">${opts.periodeLabel}</span>
        </td>
      </tr>
    </table>

    <div style="background:#fefce8;border:1.5px solid #fde047;border-radius:8px;padding:16px 20px;">
      <p style="margin:0;font-size:13px;color:#854d0e;line-height:1.6;">
        Pendapat Anda sangat berarti untuk meningkatkan kualitas pelayanan publik
        BKPSDM Kabupaten Kepulauan Anambas. Terima kasih atas partisipasi Anda.
      </p>
    </div>
  `);
  return { subject, html };
}
