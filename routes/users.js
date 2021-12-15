const express = require("express");
const router = express.Router();
const { database } = require("../config/helpers");

/* GET ONE USER MATCHING ID */
router.get("/getNameAccount/:userId", (req, res) => {
  let userId = req.params.userId;
  database
    .table("taikhoan")
    .filter({ matk: userId })
    .withFields(["tendangnhap"])
    .get()
    .then((user) => {
      if (user) {
        res.json({ user });
      } else {
        res.json({ message: `NO USER FOUND WITH ID : ${userId}` });
      }
    })
    .catch((err) => res.json(err));
});

/* UPDATE USER DATA */
router.patch("/:userId", async (req, res) => {
  let userId = req.params.userId; // Get the User ID from the parameter

  // Search User in Database if any
  let user = await database.table("users").filter({ id: userId }).get();
  if (user) {
    let userEmail = req.body.email;
    let userPassword = req.body.password;
    let userFirstName = req.body.fname;
    let userLastName = req.body.lname;
    let userUsername = req.body.username;
    let age = req.body.age;

    // Replace the user's information with the form data ( keep the data as is if no info is modified )
    database
      .table("users")
      .filter({ id: userId })
      .update({
        email: userEmail !== undefined ? userEmail : user.email,
        password: userPassword !== undefined ? userPassword : user.password,
        username: userUsername !== undefined ? userUsername : user.username,
        fname: userFirstName !== undefined ? userFirstName : user.fname,
        lname: userLastName !== undefined ? userLastName : user.lname,
        age: age !== undefined ? age : user.age,
      })
      .then((result) => res.json("User updated successfully"))
      .catch((err) => res.json(err));
  }
});

/* LOGIN */
router.post("/login", (req, res) => {
  let { email, password } = req.body;

  database
    .query(
      `select tendangnhap from taikhoan where tendangnhap like N'${email}'`
    )
    .then((prods) => {
      if (prods.length > 0) {
        database
          .query(
            `select matk, tendangnhap, matkhau from taikhoan where tendangnhap like N'${email}' and matkhau like N'${password}'`
          )
          .then((prods) => {
            if (prods.length > 0) {
              res.status(200).json({
                success: true,
                matk: prods[0].matk,
              });
            } else {
              res.json({
                success: false,
                message: "Mật khẩu truy cập không đúng. Vui lòng kiểm tra lại!",
              });
            }
          })
          .catch((err) => console.log(err));
      } else {
        res.json({
          success: false,
          message:
            "Không tìm thấy tên đăng nhập trên hệ thống. Vui lòng kiểm tra lại!",
        });
      }
    })
    .catch((err) => console.log(err));
});

/* REGISTER */
router.post("/register", (req, res) => {
  let { email, password } = req.body;

  database
    .query(
      `select tendangnhap from taikhoan where tendangnhap like N'${email}'`
    )
    .then((prods) => {
      if (prods.length > 0) {
        res.json({
          success: false,
          message:
            "Đã tồn tại tên đăng nhập trên hệ thống. Vui lòng chọn tên đăng nhập khác!",
        });
      } else {
        database
          .table("taikhoan")
          .insert({
            tendangnhap: email,
            matkhau: password,
          })
          .then(() => {
            res.status(200).json({
              success: true,
            });
          })
          .catch((err) => console.log(err));
      }
    })
    .catch((err) => console.log(err));
});

/* CHANGE PASSWORD */
router.post("/changepassword", (req, res) => {
  let { passwordCurrent, passwordNew, passwordConfirm } = req.body.data;
  let nameAccount = req.body.nameAccount;

  database
    .query(
      `select tendangnhap, matkhau from taikhoan where tendangnhap like N'${nameAccount}' and matkhau like N'${passwordCurrent}'`
    )
    .then((prods) => {
      if (prods.length > 0) {
        database
          .query(
            `update taikhoan set matkhau = N'${passwordNew}' where tendangnhap like N'${nameAccount}'`
          )
          .then((prods) => {
            res.json({
              success: true,
            });
          });
      } else {
        res.json({
          success: false,
          message: "Mật khẩu hiện tại không đúng. Vui lòng thử lại sau!",
        });
      }
    })
    .catch((err) => console.log(err));
});

module.exports = router;
