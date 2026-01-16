// import express from "express";
// import cors from "cors";
// import uploadRoutes from "./routes/routes.js";

// const app = express();
// app.use(cors());
// app.use(express.json());
// app.use("/api", uploadRoutes);

// const PORT = 5000;
// app.listen(PORT, () => console.log(`✅ Server berjalan di http://localhost:${PORT}`));

import express from "express";
import cors from "cors";
// Hapus atau komen baris ini karena file routes.js tidak ada di folder root
// import uploadRoutes from "./routes/routes.js"; 

const app = express();
app.use(cors());
app.use(express.json());

// BARIS KUNCI: Memberitahu Express untuk menyajikan semua file statis 
// (termasuk index.html, CSS, dan JS) dari folder saat ini ('.')
app.use(express.static('./')); 

const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Server berjalan di http://localhost:${PORT}`));