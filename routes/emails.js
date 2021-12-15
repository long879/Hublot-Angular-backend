const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

router.post("/", function (req, res) {
  var email = req.body.email;
  let transpoter = nodemailer.createTransport({
    service: "gmail",
    secure: false,
    port: 25,
    auth: {
      user: "Thunghiemguiemail2@gmail.com",
      pass: "Thunghiemgui@email2021",
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  let mailOptions = {
    from: "Thunghiemguiemail2@gmail.com",
    to: email,
    subject: "Thử nghiệm chức năng gửi Email",
    text: "Tin nhắn này được gửi từ localhost:4200 để thử nghiệm chức năng gửi email với thư viện nodemailer. Cám ơn bạn đã xem!",
  };

  transpoter.sendMail(mailOptions, function (err, info) {
    if (err) {
      res.status(200).json({ success: false, msg: err });
    } else {
      res.status(200).json({ success: true, msg: "Mail sent" });
    }
  });
});

module.exports = router;
