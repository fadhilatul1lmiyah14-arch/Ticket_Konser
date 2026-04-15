# 🎫 Ticket_Konser (RalyTicket) - High-Performance Ticketing System

RalyTicket adalah ekosistem penjualan tiket berperforma tinggi yang dirancang untuk menangani trafik masif secara bersamaan. Proyek ini dikembangkan selama masa magang di **Babaiyu Academy** dengan fokus pada kecepatan respon sub-detik dan skalabilitas sistem.

## 🚀 Ringkasan Teknis

- **Backend:** [ElysiaJS](https://elysiajs.com/) (Bun runtime) - Dipilih untuk mencapai performa API ultra-cepat.
- **Frontend:** React.js & TypeScript - Memastikan antarmuka yang type-safe dan responsif.
- **Database & ORM:** PostgreSQL dengan [Drizzle ORM](https://orm.drizzle.team/) - Optimasi query dan manajemen skema yang aman.
- **Payment Gateway:** Integrasi **Xendit** dengan sistem Webhook untuk sinkronisasi pembayaran real-time.
- **Tools Lain:** Tailwind CSS, Git/GitHub, Agile Methodologies.

## ✨ Fitur Utama

- **Sub-second API Response:** Menggunakan ElysiaJS untuk memastikan proses booking tiket tidak terhambat oleh latency.
- **Automated Payment Flow:** Integrasi penuh dengan Xendit mulai dari pembuatan invoice hingga update status via Webhook.
- **Scalable Architecture:** Desain skema database yang dioptimalkan untuk menjaga integritas data selama lonjakan trafik (massive concurrent traffic).
- **Admin Dashboard:** Panel khusus untuk mengelola event, stok tiket, dan memantau transaksi yang masuk.

## 📁 Struktur Repositori

```text
├── admin-dashboard/    # React-based panel untuk manajemen event
├── frontend-web/       # Aplikasi client untuk pembeli tiket
├── backend/            # Core API menggunakan ElysiaJS & Drizzle
└── README.md
