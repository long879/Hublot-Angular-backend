const express = require("express");
const router = express.Router();
const { database } = require("../config/helpers");

/* GET ALL PRODUCTS. */
router.get("/", function (req, res) {
  database
    .table("sanpham as sp")
    .join([
      {
        table: "loaisanpham as lsp",
        on: `lsp.malsp = sp.malsp`,
      },
      {
        table: "thuonghieu as th",
        on: `th.math = sp.math`,
      },
    ])
    .withFields([
      "sp.masp",
      "lsp.malsp",
      "th.math",
      "th.tenth",
      "lsp.tenlsp",
      "sp.tensp",
      "sp.dongia",
      "sp.hinhsp1",
      "sp.hinhsp2",
      "sp.hinhsp3",
      "sp.hinhsp4",
      "sp.hinhsp5",
      "sp.soluong",
    ])
    .sort({ masp: 0.1 })
    .getAll()
    .then((prods) => {
      if (prods.length > 0) {
        res.status(200).json({
          count: prods.length,
          products: prods,
        });
      } else {
        res.json({ message: "No products founds" });
      }
    })
    .catch((err) => console.log(err));
});

/* GET SINGLE PRODUCTS. */
router.get("/:prodId", function (req, res) {
  let productId = req.params.prodId;

  database
    .table("sanpham as sp")
    .join([
      {
        table: "loaisanpham as lsp",
        on: `lsp.malsp = sp.malsp`,
      },
      {
        table: "thuonghieu as th",
        on: `th.math = sp.math`,
      },
    ])
    .withFields([
      "sp.masp",
      "lsp.malsp",
      "th.math",
      "th.tenth",
      "lsp.tenlsp",
      "sp.tensp",
      "sp.dongia",
      "sp.hinhsp1",
      "sp.hinhsp2",
      "sp.hinhsp3",
      "sp.hinhsp4",
      "sp.hinhsp5",
      "sp.soluong",
    ])
    .filter({
      "sp.masp": productId,
    })
    .get()
    .then((prod) => {
      if (prod) {
        res.status(200).json(prod);
      } else {
        res.json({ message: `No product found with product id: ${productId}` });
      }
    })
    .catch((err) => console.log(err));
});

// GET ALL PRODUCTS FROM ONE CATEGORY
router.get("/loaisanpham/:tenlsp", function (req, res) {
  const tenlsp = req.params.tenlsp;

  database
    .table("sanpham as sp")
    .join([
      {
        table: "thuonghieu as th",
        on: "th.math = sp.math",
      },
      {
        table: "loaisanpham as lsp",
        on: `lsp.malsp = sp.malsp WHERE lsp.tenlsp LIKE N'${tenlsp}'`,
      },
    ])
    .withFields([
      "sp.masp",
      "lsp.malsp",
      "th.math",
      "th.tenth",
      "lsp.tenlsp",
      "sp.tensp",
      "sp.dongia",
      "sp.hinhsp1",
      "sp.hinhsp2",
      "sp.hinhsp3",
      "sp.hinhsp4",
      "sp.hinhsp5",
      "sp.soluong",
    ])
    .sort({ masp: 0.1 })
    .getAll()
    .then((prods) => {
      if (prods.length > 0) {
        res.status(200).json({
          count: prods.length,
          products: prods,
        });
      } else {
        res.json({
          message: `No products found from ${tenlsp} loaisanpham`,
        });
      }
    })
    .catch((err) => console.log(err));
});

// GET ALL PRODUCTS FROM ONE TRADEMARK
router.get("/loaithuonghieu/:tenth", function (req, res) {
  const tenth = req.params.tenth;

  database
    .table("sanpham as sp")
    .join([
      {
        table: "loaisanpham as lsp",
        on: "lsp.malsp = sp.malsp",
      },
      {
        table: "thuonghieu as th",
        on: `th.math = sp.math WHERE th.tenth LIKE N'${tenth}'`,
      },
    ])
    .withFields([
      "sp.masp",
      "lsp.malsp",
      "th.math",
      "th.tenth",
      "lsp.tenlsp",
      "sp.tensp",
      "sp.dongia",
      "sp.hinhsp1",
      "sp.hinhsp2",
      "sp.hinhsp3",
      "sp.hinhsp4",
      "sp.hinhsp5",
      "sp.soluong",
    ])
    .sort({ masp: 0.1 })
    .getAll()
    .then((prods) => {
      if (prods.length > 0) {
        res.status(200).json({
          count: prods.length,
          products: prods,
        });
      } else {
        res.json({
          message: `No products found from ${tenth} loaisanpham`,
        });
      }
    })
    .catch((err) => console.log(err));
});

router.post("/filter", function (req, res) {
  arrFilter = req.body.arrFilter;
  let filterTrademark = arrFilter[0].filter((filter) => filter.active === true);
  let filterCategory = arrFilter[1].filter((filter) => filter.active === true);
  let filterPriceFrom = arrFilter[2].from;
  let filterPriceTo = arrFilter[2].to;
  let queryTrademark = filterTrademark
    .map((filter) => {
      return `select sp.masp, lsp.malsp, th.math, th.tenth, lsp.tenlsp, sp.tensp, sp.dongia, sp.hinhsp1, sp.hinhsp2, sp.hinhsp3, sp.hinhsp4, sp.hinhsp5, sp.soluong from sanpham as sp join loaisanpham as lsp on (sp.malsp = lsp.malsp) join thuonghieu as th on (th.math = sp.math) where th.tenth like N'${filter.trademark}' union `;
    })
    .join(" ");
  let queryCategory = filterCategory
    .map((filter) => {
      return `select sp.masp, lsp.malsp, th.math, th.tenth, lsp.tenlsp, sp.tensp, sp.dongia, sp.hinhsp1, sp.hinhsp2, sp.hinhsp3, sp.hinhsp4, sp.hinhsp5, sp.soluong from sanpham as sp join loaisanpham as lsp on (sp.malsp = lsp.malsp) join thuonghieu as th on (th.math = sp.math) where lsp.tenlsp like N'${filter.category}' union `;
    })
    .join(" ");
  let queryPrice = `select sp.masp, lsp.malsp, th.math, th.tenth, lsp.tenlsp, sp.tensp, sp.dongia, sp.hinhsp1, sp.hinhsp2, sp.hinhsp3, sp.hinhsp4, sp.hinhsp5, sp.soluong from sanpham as sp join loaisanpham as lsp on (sp.malsp = lsp.malsp) join thuonghieu as th on (th.math = sp.math) where sp.dongia between ${filterPriceFrom} and ${filterPriceTo}`;

  if (
    Array.isArray(filterTrademark) &&
    filterTrademark.length &&
    Array.isArray(filterCategory) &&
    filterCategory.length
  ) {
    if (filterPriceTo > 0) {
      database
        .query(
          "(" +
            queryTrademark.slice(0, queryTrademark.length - 6) +
            ") intersect (" +
            queryCategory.slice(0, queryCategory.length - 6) +
            ") intersect (" +
            queryPrice +
            ")"
        )
        .then((result) =>
          res.json({
            count: result.length,
            products: result,
          })
        )
        .catch((err) => console.log(err));
    } else {
      database
        .query(
          "(" +
            queryTrademark.slice(0, queryTrademark.length - 6) +
            ") intersect (" +
            queryCategory.slice(0, queryCategory.length - 6) +
            ")"
        )
        .then((result) =>
          res.json({
            count: result.length,
            products: result,
          })
        )
        .catch((err) => console.log(err));
    }
  } else if (Array.isArray(filterTrademark) && filterTrademark.length) {
    if (filterPriceTo > 0) {
      database
        .query(
          "(" +
            queryTrademark.slice(0, queryTrademark.length - 6) +
            ") intersect (" +
            queryPrice +
            ")"
        )
        .then((result) =>
          res.json({
            count: result.length,
            products: result,
          })
        )
        .catch((err) => console.log(err));
    } else {
      database
        .query(queryTrademark.slice(0, queryTrademark.length - 6))
        .then((result) =>
          res.json({
            count: result.length,
            products: result,
          })
        )
        .catch((err) => console.log(err));
    }
  } else if (Array.isArray(filterCategory) && filterCategory.length) {
    if (filterPriceTo > 0) {
      database
        .query(
          "(" +
            queryCategory.slice(0, queryCategory.length - 6) +
            ") intersect (" +
            queryPrice +
            ")"
        )
        .then((result) =>
          res.json({
            count: result.length,
            products: result,
          })
        )
        .catch((err) => console.log(err));
    } else {
      database
        .query(queryCategory.slice(0, queryCategory.length - 6))
        .then((result) =>
          res.json({
            count: result.length,
            products: result,
          })
        )
        .catch((err) => console.log(err));
    }
  } else {
    if (filterPriceTo > 0) {
      database
        .query(queryPrice)
        .then((result) =>
          res.json({
            count: result.length,
            products: result,
          })
        )
        .catch((err) => console.log(err));
    } else {
      database
        .table("sanpham as sp")
        .join([
          {
            table: "loaisanpham as lsp",
            on: `lsp.malsp = sp.malsp`,
          },
          {
            table: "thuonghieu as th",
            on: `th.math = sp.math`,
          },
        ])
        .withFields([
          "sp.masp",
          "lsp.malsp",
          "th.math",
          "th.tenth",
          "lsp.tenlsp",
          "sp.tensp",
          "sp.dongia",
          "sp.hinhsp1",
          "sp.hinhsp2",
          "sp.hinhsp3",
          "sp.hinhsp4",
          "sp.hinhsp5",
          "sp.soluong",
        ])
        .sort({ masp: 0.1 })
        .getAll()
        .then((prods) => {
          if (prods.length > 0) {
            res.status(200).json({
              count: prods.length,
              products: prods,
            });
          } else {
            res.json({ message: "No products founds" });
          }
        })
        .catch((err) => console.log(err));
    }
  }
});

module.exports = router;
