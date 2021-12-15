const express = require("express");
const router = express.Router();
const { database } = require("../config/helpers");

// GET ALL ORDERS OF A PERSON
router.get("/ordersofperson/:makh", function (req, res) {
  const makh = req.params.makh;
  database
    .table("taikhoan as tk")
    .join([
      {
        table: "donhang as dh",
        on: `tk.matk = dh.matk WHERE dh.matk = ${makh}`,
      },
    ])
    .withFields(["dh.madh", "dh.ngaylap", "dh.ngaygiao", "dh.tongtien"])
    .sort({ "dh.madh": 0.1 })
    .getAll()
    .then((orders) => {
      if (orders.length > 0) {
        res.status(200).json({
          count: orders.length,
          orders: orders,
        });
      } else {
        res.json({
          count: 0,
          message: `No orders found with makh = ${makh}`,
        });
      }
    })
    .catch((err) => console.log(err));
});

// GET ORDER DETAIL OF A PERSON
router.get("/orderdetailofperson/:madh", function (req, res) {
  const madh = req.params.madh;
  database
    .table("chitietdonhang as ctdh")
    .join([
      {
        table: "sanpham as sp",
        on: "sp.masp = ctdh.masp",
      },
      {
        table: "donhang as dh",
        on: `ctdh.madh = dh.madh WHERE dh.madh = ${madh}`,
      },
    ])
    .withFields([
      "sp.hinhsp1",
      "sp.tensp",
      "sp.dongia",
      "ctdh.soluong",
      "ctdh.thanhtien",
    ])
    .sort({ "dh.madh": 0.1 })
    .getAll()
    .then((orders) => {
      if (orders.length > 0) {
        res.status(200).json(orders);
      } else {
        res.json({
          message: `No orders found with madh = ${madh}`,
        });
      }
    })
    .catch((err) => console.log(err));
});

// A NEW ORDER
router.post("/new", (req, res) => {
  let { accountId, total, products } = req.body;
  let dayOrder = new Date();
  let daySend = new Date();
  daySend.setDate(daySend.getDate() + 3);
  dayOrder = dayOrder.toLocaleDateString("en-ZA");
  daySend = daySend.toLocaleDateString("en-ZA");

  if (accountId != null && !isNaN(accountId)) {
    database
      .table("donhang")
      .insert({
        ngaylap: dayOrder,
        ngaygiao: daySend,
        tongtien: total,
        matk: accountId,
      })
      .then((newOrderId) => {
        if (newOrderId > 0) {
          products.forEach(async (p) => {
            let data = await database
              .table("sanpham")
              .filter({ masp: p.id })
              .withFields(["soluong", "dongia", "tensp"])
              .get();
            let inCart = p.incart;
            if (data.soluong > 0) {
              data.soluong = data.soluong - inCart;
              if (data.soluong >= 0) {
                database
                  .table("chitietdonhang")
                  .insert({
                    madh: newOrderId,
                    masp: p.id,
                    soluong: inCart,
                    thanhtien: inCart * data.dongia,
                  })
                  .then(() => {
                    database
                      .table("sanpham")
                      .filter({ masp: p.id })
                      .update({
                        soluong: data.soluong,
                      })
                      .then(() => {
                        res.json({
                          message: `Đã hoàn tất lập hóa đơn mới với mã hóa đơn là: ${newOrderId}`,
                          success: true,
                          madh: newOrderId,
                          masp: products,
                        });
                      })
                      .catch((err) => console.log(err));
                  })
                  .catch((err) => console.log(err));
              } else {
                res.json({
                  message: `Số lượng sản phẩm ${data.tensp} còn lại không đủ đáp ứng yêu cầu mua trong giỏ hàng của quý khách. Xin quý khách thông cảm`,
                  success: false,
                });
              }
            } else {
              res.json({
                message: `Số lượng sản phẩm ${data.tensp} trên hệ thống đã hết hàng`,
                success: false,
              });
            }
          });
        } else {
          res.json({
            message: "Đơn hàng mới gặp lỗi khi thêm vào hệ thống",
            success: false,
          });
        }
      })
      .catch((err) => console.log(err));
  } else {
    res.json({
      message: "new Order failed",
      success: false,
    });
  }
});

// FAKE PAYMENT GATEWAY CALL
router.post("/payment", (req, res) => {
  setTimeout(() => {
    res.status(200).json({ success: true });
  }, 3000);
});

module.exports = router;
