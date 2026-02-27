import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const LAYANAN_LIST = [
  "Diklat Kepemimpinan",
  "Diklat Teknis Fungsional",
  "Izin Perceraian Pegawai ASN",
  "Orientasi PPPK",
  "Pelatihan Dasar CPNS",
  "Pemeriksaan Pelanggaran Disiplin ASN",
  "Pengajuan Cuti Diluar Tanggunan Negara",
  "Pengajuan Konduite Pegawai",
  "Penilaian Kinerja Pegawai ASN",
  "Tugas Belajar PNS",
  "Usulan Satya Lancana Karya Satya",
  "Mutasi Masuk",
  "Mutasi Keluar",
  "Mutasi OPD",
  "Karis Karsu",
  "Kenaikan Pangkat",
  "Pencantuman Gelar",
  "Peninjauan Masa Kerja",
  "Ujian Dinas",
  "Data Dan Informasi Kepegawaian",
  "Pensiun Dan Pemberhentian Asn",
  "Persyaratan Pengadaan Asn"
];

const PEGAWAI_LIST = [
  "USMAN, ST., M.Si",
  "RINA SAPARIYANI, ST",
  "EVA NILASARI, SE",
  "AAN NUGRAHA, SE",
  "DONI WARJIANTO, SE",
  "ERWIN, S.I.P",
  "EWIN SANRI PUTRA HUTAPEA, S.Kom",
  "MEGA KUMALA SARI, SP",
  "ZURIYAH, S.I.P",
  "LI CUAN, SE",
  "AN UMILLAH WAHYU NURI AZIZAH, S.Psi",
  "FIRMAN MELDHOM, ST",
  "BAYU PRATAMA PUTRA, A.Md",
  "KARYAWARI, S.AP",
  "HETTIANDRA, S.Sos",
  "RIZKI SYAHPUTRA, S.Kom",
  "ANDI FIRMANSYAH, B.Sc",
  "WISNU HARDIYANTO, S.M",
  "JONEKA SAPUTRA, SE",
  "WIRANTO TIMOTIUS SITUMORANG, S.TR.IP",
  "RIKY MARIZA PUTRA, S.I.P",
  "IWAN DARMAWAN, S.I.P",
  "WARSONO, S.IP",
  "RONIZAL, S.A.P",
  "MARCELLINA, S.A.P",
  "SURLIYANA, S.AP",
  "KHERLINA HAKIM S,S.IP",
  "FITRA SETYARINI, S.E",
  "MIRNA AFRIYANTI, S.ST",
  "NANANG NURDIN, S.Sos",
  "MEZIANA, S.AP",
  "AGNES, S.Sos",
  "SARYENI, S.I.P",
  "TOMI, S.AP",
  "WENNY ANDRIANI, S.Ak",
  "ROSIANA, S.Pd",
  "BAGAS, S.T",
  "YUHANDRI, S.Sos",
  "JULIAN SYAH PUTRA, S.P",
  "EKA KADIR ALI AKBAR",
  "APANDI",
  "NATHASYA SALSABILA",
  "SUSNITA",
  "TUTI SUNARTI",
  "ZAKARIA, S.I.P",
  "DONI DAMARA",
  "HAFNI OKTAFIANI, S.Pt",
  "PUTRI DEWI"
];

// ── Admin credentials — change these before going to production ──────────
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "bkpsd2026";

async function main() {
  console.log("🌱 Seeding Database...");

  // 1. Seed Admin
  console.log("Creating admin user...");
  const existingAdmin = await prisma.admin.findUnique({ where: { username: ADMIN_USERNAME } });
  if (!existingAdmin) {
    const hashed = await bcrypt.hash(ADMIN_PASSWORD, 12);
    await prisma.admin.create({
      data: { username: ADMIN_USERNAME, password: hashed },
    });
    console.log(`✅ Admin created: ${ADMIN_USERNAME}`);
  } else {
    console.log(`ℹ️  Admin already exists: ${ADMIN_USERNAME}`);
  }

  // 2. Seed Services
  console.log(`Creating ${LAYANAN_LIST.length} Services...`);
  for (const nama of LAYANAN_LIST) {
    const exists = await prisma.layanan.findFirst({ where: { nama } });
    if (!exists) {
      await prisma.layanan.create({ data: { nama } });
    }
  }

  // 3. Seed Employees
  console.log(`Creating ${PEGAWAI_LIST.length} Employees...`);
  for (const nama of PEGAWAI_LIST) {
    const exists = await prisma.pegawai.findFirst({ where: { nama } });
    if (!exists) {
      await prisma.pegawai.create({ data: { nama } });
    }
  }

  // 4. Seed active Periode
  const existingPeriode = await prisma.periode.findFirst({ where: { status: "AKTIF" } });
  if (!existingPeriode) {
    await prisma.periode.create({
      data: {
        label: "Global Access",
        status: "AKTIF",
        token: "global-token-2026",
      }
    });
    console.log("✅ Created active Periode.");
  }

  console.log("✅ Seeding Complete!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });