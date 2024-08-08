const Pool = require("pg").Pool;
const config = require("../configs/db.config");
const pool = new Pool(config);
const path = require("path");
const fs = require("fs");
const filter = require("../utils/filter.utils");

pool.connect((err) => {
  if (err) {
    console.error("Gagal terkoneksi dengan database:", err);
  } else {
    console.log("Koneksi database berhasil!");
  }
});

async function getDataBooks(req) {
  const client = await pool.connect();
  try {
    return new Promise(async (resolve, reject) => {
      let query = "SELECT * FROM books";
      client.query(await filter(req.query, query), (error, results) => {
        if (error) {
          reject(error);
        }
        resolve(results);
      });
    });
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    client.release();
  }
}

async function postDataBooks(req) {
  return new Promise(async (resolve, reject) => {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      const body = req.body;
      let title = body.title;
      let description = body.description;
      let release_year = body.release_year;
      let price = body.price;
      let total_page = body.total_page;
      let category_id = body.category_id;

      let thickness;
      if (total_page <= 100) {
        thickness = "tipis";
      } else if (total_page >= 201) {
        thickness = "tebal";
      } else {
        thickness = "sedang";
      }

      // Mendapatkan URL dari file yang diunggah
      let image_url = "";
      if (req.files != null) {
        image_url = await handleImageUpload(req);
      }

      const results = await client.query(
        "INSERT INTO book (title, description, image_url, release_year, price, total_page, thickness, category_id) " +
          "VALUES ($1, $2, $3, $4, $5, $6, $7, $8) " +
          "RETURNING id, title, description, image_url, release_year, price, total_page, thickness, category_id, created_at ",
        [
          title,
          description,
          image_url,
          release_year,
          price,
          total_page,
          thickness,
          category_id,
        ]
      );

      await client.query("COMMIT");

      resolve(results.rows);
    } catch (error) {
      await client.query("ROLLBACK");
      reject(error);
    } finally {
      client.release();
    }
  });
}

async function editDataBooks(id, req) {
  return new Promise(async (resolve, reject) => {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      const body = req.body;
      let title = body.title;
      let description = body.description;
      let release_year = body.release_year;
      let price = body.price;
      let total_page = body.total_page;
      let category_id = body.category_id;

      let thickness;
      if (total_page <= 100) {
        thickness = "tipis";
      } else if (total_page >= 201) {
        thickness = "tebal";
      } else {
        thickness = "sedang";
      }

      // Mendapatkan URL dari file yang diunggah
      let image_url = "";
      if (req.files != null) {
        image_url = await handleImageUpload(req);
      }

      const cekData = await client.query(
        "SELECT * FROM book " + "WHERE id=$1 ",
        [id]
      );

      if (image_url != "") {
        if (cekData.rows[0]["image_url"] != "") {
          deleteImageByUrl(cekData.rows[0]["image_url"]);
        }
      }

      console.log(image_url);
      let results = null;
      if (image_url != "") {
        console.log(image_url+ " aDA");
        results = await client.query(
          "UPDATE book " +
            "SET title=$1, description=$2, image_url=$3, release_year=$4, price=$5, total_page=$6, thickness=$7, category_id=$8, updated_at=CURRENT_TIMESTAMP " +
            "WHERE id=$9 RETURNING id, title, description, image_url, release_year, price, total_page, thickness, category_id, updated_at ",
          [
            title,
            description,
            image_url,
            release_year,
            price,
            total_page,
            thickness,
            category_id,
            id,
          ]
        );
      } else {
        console.log(image_url+" gak ada");
        results = await client.query(
          "UPDATE book " +
            "SET title=$1, description=$2, release_year=$3, price=$4, total_page=$5, thickness=$6, category_id=$7, updated_at=CURRENT_TIMESTAMP " +
            "WHERE id=$8 RETURNING id, title, description, image_url, release_year, price, total_page, thickness, category_id, updated_at ",
          [
            title,
            description,
            release_year,
            price,
            total_page,
            thickness,
            category_id,
            id,
          ]
        );
      }

      await client.query("COMMIT");

      resolve(results.rows);
    } catch (error) {
      await client.query("ROLLBACK");
      console.log(error);
      reject(error);
    } finally {
      client.release();
    }
  });
}

async function deleteDataBooks(id) {
  return new Promise(async (resolve, reject) => {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      const results = await client.query(
        "DELETE FROM book WHERE id=$1 RETURNING id, title, image_url",
        [id]
      );

      await client.query("COMMIT");

      if (results.rows[0]["image_url"] != "") {
        deleteImageByUrl(results.rows[0]["image_url"]);
      }

      resolve(results.rows);
    } catch (error) {
      await client.query("ROLLBACK");
      reject(error);
    } finally {
      client.release();
    }
  });
}

async function handleImageUpload(req) {
  return new Promise((resolve, reject) => {
    let image_url = "";

    if (req.files != null || Object.keys(req.files).length != 0) {
      const image = req.files.image;

      // Tentukan direktori untuk menyimpan file
      const uploadPath = path.join(__dirname, "../public", "uploads");

      // Pastikan direktori sudah ada
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      let newTitle = req.body.title.replaceAll(" ", "-");
      const fileName = newTitle + "-" + Date.now() + path.extname(image.name);
      const destinationPath = path.join(uploadPath, fileName);

      // Pindahkan file ke direktori tujuan
      image.mv(destinationPath, (err) => {
        if (err) {
          console.error(err);
          reject(err);
        }

        // Mendapatkan URL dari file yang diunggah
        let imageUrl =
          req.protocol + "://" + req.get("host") + "/uploads/" + fileName;

        console.log("Berhasil mengunggah gambar! " + imageUrl);
        image_url = imageUrl;

        // Resolving promise dengan image_url
        resolve(image_url);
      });
    } else {
      // Jika tidak ada file diunggah, resolve promise dengan null atau nilai default
      resolve("");
    }
  });
}

function deleteImageByUrl(imageUrl) {
  try {
    // Mendapatkan path lokal dari URL
    const localPath = path.join(
      __dirname,
      "../public",
      "uploads",
      path.basename(imageUrl)
    );
    console.log(localPath);
    // Menghapus file
    fs.unlinkSync(localPath);

    console.log(`Gambar berhasil dihapus: ${localPath}`);
    return true;
  } catch (error) {
    console.error(`Gagal menghapus gambar: ${imageUrl}`, error);
    return false;
  }
}

module.exports = {
  getDataBooks,
  postDataBooks,
  deleteDataBooks,
  editDataBooks,
};
