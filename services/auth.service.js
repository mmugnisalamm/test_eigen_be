import { Pool } from "pg";
import config from "../configs/db.config";
const pool = new Pool(config);
import { sign } from "jsonwebtoken";
require("dotenv").config();
import { compare, hash } from "bcrypt";
const saltRounds = 10;

pool.connect((err) => {
  if (err) {
    console.error("Gagal terkoneksi dengan database:", err);
  } else {
    console.log("Koneksi database berhasil!");
  }
});

async function login(body) {
  const client = await pool.connect();
  return new Promise(async (resolve, reject) => {
    try {
      const results = await client.query(
        "SELECT * FROM users WHERE username=$1",
        [body.username]
      );
      if (results.rowCount > 0) {
        compare(body.password, results.rows[0].password).then((isMatch) => {
          if (isMatch) {
            const user = {
              id: results.rows[0].id,
              username: results.rows[0].username,
            };
            const token = createToken(user);
            const hasil = [
              {
                id: results.rows[0].id,
                name: results.rows[0].name,
                email: results.rows[0].email,
                username: results.rows[0].username,
                token: token,
              },
            ];
            resolve(hasil);
          } else {
            reject("Password salah!");
          }
        }).catch((compareError) => {
          reject(compareError);
        });
      } else {
        reject([]);
      }
    } catch (error) {
      console.error(error);
      reject(error);
    } finally {
      client.release();
    }
  });
}

async function register(req) {
  return new Promise(async (resolve, reject) => {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      const body = req;
      let name = body.name;
      let email = body.email;
      let username = body.username;
      let password = body.password;

      password = await hash(password, saltRounds);

      const results = await client.query(
        "INSERT INTO users (name, email, username, password) " +
          "VALUES ($1, $2, $3, $4) " +
          "RETURNING name, email, username ",
        [name, email, username, password]
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

// Fungsi untuk membuat token
function createToken(user) {
  return sign(
    { id: user.id, username: user.username },
    process.env.SECRET_KEY,
    {
      expiresIn: "24h",
    }
  );
}

export default {
  login,
  register
};
