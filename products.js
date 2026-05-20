/**
 * Du lieu san pham du phong (offline) cho Happy Kitchen.
 * Anh chinh duoc tai tu sieuthibep24h.com.vn ve thu muc images/products/site/.
 * Khi backend MySQL hoat dong, du lieu se duoc nap tu API va ghi de bien nay.
 */

const SUPPORT_IMAGES = [
  "images/products/thumb-tech.svg",
  "images/products/thumb-warranty.svg",
  "images/products/thumb-install.svg"
];

function _features(cat) {
  const map = {
    "bep-dien-tu": [
      "Mặt kính chịu nhiệt cao, chống trầy xước",
      "Cảm ứng điều khiển trượt nhạy",
      "Tự nhận diện đáy nồi, khóa an toàn trẻ em",
      "Chế độ Booster đun sôi nhanh",
      "Hẹn giờ tới 99 phút, tự ngắt khi quá nhiệt"
    ],
    "may-hut-mui": [
      "Lưu lượng hút mạnh mẽ, khử mùi nhanh",
      "Lưới lọc dầu inox tháo rời dễ vệ sinh",
      "3 cấp tốc độ + chế độ Booster",
      "Đèn LED chiếu sáng vùng nấu",
      "Vận hành êm dưới 60 dB"
    ],
    "may-rua-bat": [
      "Cảm biến độ bẩn AI tự điều chỉnh nước/thời gian",
      "Nhiều chương trình rửa: ECO, Auto, Quick, Glass, Baby",
      "Sấy đối lưu khô ráo, diệt khuẩn ở 70°C",
      "Tiết kiệm điện - nước",
      "Khoang inox 304 chống gỉ, chống ăn mòn"
    ],
    "chau-voi": [
      "Inox SUS304 chống gỉ, vân nhám chống xước",
      "Lớp cao su giảm chấn dưới đáy chậu",
      "Vòi mạ chrome, chống vôi hóa",
      "Khả năng chịu va đập tốt",
      "Lắp đặt nhanh, đi kèm phụ kiện đầy đủ"
    ],
    "may-loc-nuoc": [
      "Hệ thống lọc đa cấp loại bỏ kim loại nặng",
      "Bổ sung khoáng tự nhiên có lợi",
      "Lõi lọc chính hãng, dễ thay thế",
      "Tiết kiệm nước, tỉ lệ thu hồi cao",
      "Bảo hành chính hãng, hỗ trợ vệ sinh định kỳ"
    ],
    "bo-noi": [
      "Inox 304 chuẩn thực phẩm",
      "Đáy từ 3 - 5 lớp truyền nhiệt nhanh",
      "Tay cầm cách nhiệt chắc chắn",
      "Nắp kính cường lực có lỗ thoát hơi",
      "Dùng được cho mọi loại bếp (bếp từ, gas, điện...)"
    ]
  };
  return map[cat] || [];
}

function _specs(cat, brand, origin) {
  const base = { "Thương hiệu": brand, "Xuất xứ": origin, "Bảo hành": "24 tháng chính hãng" };
  const map = {
    "bep-dien-tu":  { "Số vùng nấu": "2-3 vùng cảm ứng từ", "Tổng công suất": "4.000 - 6.000W", "Mức nhiệt": "9 mức + Booster", "Hẹn giờ": "1 - 99 phút", "Mặt kính": "Kính cường lực Schott Ceran/Eurokera" },
    "may-hut-mui":  { "Lưu lượng hút": "850 - 1.200 m³/h", "Mức ồn": "≤ 58 dB", "Tốc độ gió": "3 cấp + Booster", "Công suất": "180 - 250W", "Đèn chiếu sáng": "LED" },
    "may-rua-bat":  { "Sức chứa": "6 - 16 bộ chén dĩa", "Chương trình rửa": "6 - 8 chương trình", "Mức ồn": "44 - 49 dB", "Lượng nước/chu trình": "6 - 10 lít", "Cấp năng lượng": "A++/A+++" },
    "chau-voi":     { "Vật liệu": "Inox SUS304", "Độ dày": "1.0 - 1.2 mm", "Số hộc": "1 - 2 hộc", "Phụ kiện": "Giỏ thoát nước, ống xả", "Lớp chống ồn": "Cao su giảm chấn" },
    "may-loc-nuoc": { "Số cấp lọc": "9 - 11 cấp", "Lưu lượng": "10 - 15 lít/giờ", "Áp lực nước cấp": "0.1 - 4 bar", "Nhiệt độ nước cấp": "5 - 38 °C", "Tuổi thọ lõi": "12 - 24 tháng" },
    "bo-noi":       { "Số món": "4 - 6 món", "Vật liệu": "Inox 304 đáy từ", "Khả năng dùng": "Mọi loại bếp", "Tay cầm": "Bakelite cách nhiệt", "Nắp": "Kính cường lực có lỗ thoát hơi" }
  };
  return Object.assign({}, base, map[cat] || {});
}

// Cau truc moi dong: [id, name, category, brand, origin, oldPrice, price, sale, description, mainImage]
const RAW_PRODUCTS = [
  ["bep-tu-2-vung-nau-hafele-hc-i3732a","Bếp từ 2 vùng nấu Hafele HC-I3732A","bep-dien-tu","Hafele","Đức",16950000,7100000,58,
    "Bếp từ Hafele HC-I3732A 2 vùng nấu sang trọng, mặt kính Schott Ceran nhập khẩu Đức, công suất 3.700W, cảm ứng trượt thông minh, khóa an toàn trẻ em và hẹn giờ tới từng phút.",
    "images/products/site/bep-tu-2-vung-nau-hafele-hc-i3732a.jpg"],
  ["bep-tu-hesman-hb-1202","Bếp từ Hesman HB 1202","bep-dien-tu","Hesman","Tây Ban Nha",16200000,10900000,33,
    "Bếp từ Hesman HB 1202 thiết kế tinh tế, vùng nấu cảm ứng từ với 9 mức nhiệt, an toàn cho gia đình và tiết kiệm điện đáng kể.",
    "images/products/site/bep-tu-hesman-hb-1202.jpg"],
  ["bep-tu-chefs-eh-dih888v","Bếp từ Chefs EH-DIH888V","bep-dien-tu","Chefs","Đức",22500000,13200000,41,
    "Bếp từ đôi Chefs EH-DIH888V phiên bản nâng cấp với cảm ứng cong toàn mặt kính, công nghệ Inverter tiết kiệm điện và 14 chế độ nấu cài sẵn.",
    "images/products/site/bep-tu-chefs-eh-dih888v.png"],
  ["bep-tu-eurosun-eu-t888g","Bếp Từ Eurosun EU-T888G","bep-dien-tu","Eurosun","Đức",22890000,14000000,39,
    "Bếp từ đôi Eurosun EU-T888G mặt kính Schott Ceran, 2 vùng nấu cảm ứng từ công suất tổng 4.400W, cảm biến nhiệt và chức năng tự ngắt an toàn.",
    "images/products/site/bep-tu-eurosun-eu-t888g.png"],
  ["bep-tu-chefs-eh-dih888","Bếp Từ Chefs EH-DIH888","bep-dien-tu","Chefs","Đức",22900000,12800000,44,
    "Bếp từ Chefs EH-DIH888 đôi cảm ứng từ Inverter, 9 mức nhiệt + Booster, tự nhận diện đáy nồi và khóa trẻ em, phù hợp cho mọi căn bếp hiện đại.",
    "images/products/site/bep-tu-chefs-eh-dih888.jpg"],

  ["may-chu-t-cz-he70bk","Máy hút mùi chữ T CZ HE70BK","may-hut-mui","CZ","Indonesia",13980000,4600000,67,
    "Máy hút mùi chữ T CZ HE70BK kích thước 70cm, mặt kính cong cao cấp, lưu lượng hút mạnh, vận hành êm và đèn LED chiếu sáng vùng nấu.",
    "images/products/site/may-chu-t-cz-he70bk.jpg"],
  ["may-treo-doc-lap-cz-350c","Máy treo độc lập CZ 350C","may-hut-mui","CZ","Indonesia",15950000,6500000,59,
    "Máy hút mùi treo độc lập CZ 350C với thiết kế ấn tượng, phù hợp đảo bếp, lưu lượng hút lớn và lưới lọc inox dễ vệ sinh.",
    "images/products/site/may-treo-doc-lap-cz-350c.jpg"],
  ["may-hut-mui-doc-lap-cz-7038gbb","Máy hút mùi độc lập CZ 7038GBB","may-hut-mui","CZ","Indonesia",18750000,7400000,61,
    "Máy hút mùi độc lập CZ 7038GBB sang trọng, mặt kính đen mờ, cảm ứng touch nhạy bén, 3 cấp tốc độ kèm chế độ Booster.",
    "images/products/site/may-hut-mui-doc-lap-cz-7038gbb.jpg"],
  ["may-hut-mui-feuer-t567","Máy hút mùi FEUER T567","may-hut-mui","FEUER","Đức",11800000,6400000,46,
    "Máy hút mùi FEUER T567 thiết kế chữ T 70cm, lưu lượng hút 1.000 m³/h, độ ồn thấp và đèn LED tiết kiệm điện.",
    "images/products/site/may-hut-mui-feuer-t567.png"],

  ["may-rua-bat-cz-dws128c16i","Máy rửa bát Indonesia CZ DWS128C16I (16 bộ)","may-rua-bat","CZ","Indonesia",29980000,13300000,56,
    "Máy rửa bát CZ DWS128C16I sức chứa 16 bộ chén dĩa, 8 chương trình rửa, cảm biến AI và sấy đối lưu nhiệt 70°C diệt khuẩn an toàn.",
    "images/products/site/may-rua-bat-cz-dws128c16i.jpg"],
  ["may-rua-bat-cz-dsw809eu","Máy rửa bát Malaysia CZ DSW809EU Seri 8 (15 bộ)","may-rua-bat","CZ","Malaysia",28980000,11100000,62,
    "Máy rửa bát CZ DSW809EU Seri 8 sức chứa 15 bộ, công nghệ Auto Open Door sấy khô tự nhiên, tiết kiệm điện và bảo vệ bát đĩa.",
    "images/products/site/may-rua-bat-cz-dsw809eu.jpg"],
  ["may-rua-bat-cz-p1036","Máy rửa bát Malaysia CZ P1036","may-rua-bat","CZ","Malaysia",25980000,10300000,60,
    "Máy rửa bát CZ P1036 thiết kế âm tủ tinh tế, nhiều chương trình rửa và cảm biến độ bẩn cho hiệu quả sạch tối ưu.",
    "images/products/site/may-rua-bat-cz-p1036.jpg"],
  ["may-rua-bat-cz-qp368r","Máy rửa bát CZ QP368R (6 bộ)","may-rua-bat","CZ","Trung Quốc",13590000,4700000,65,
    "Máy rửa bát CZ QP368R compact để bàn, sức chứa 6 bộ, 6 chương trình rửa, phù hợp gia đình 2-4 người.",
    "images/products/site/may-rua-bat-cz-qp368r.jpg"],

  ["voi-rua-bat-day-rut-kluger-klf0030s","Vòi rửa bát dây rút Kluger KLF0030S","chau-voi","Kluger","Đức",3390000,1200000,65,
    "Vòi rửa bát dây rút Kluger KLF0030S thân đồng thau mạ chrome, vòi rút dài 60cm, 2 chế độ tia, bảo hành chính hãng.",
    "images/products/site/voi-rua-bat-day-rut-kluger-klf0030s.jpg"],
  ["chau-rua-bat-kluger-kf8850fs","Chậu rửa bát Kluger KF8850FS Basic","chau-voi","Kluger","Đức",8190000,4500000,45,
    "Chậu rửa bát Kluger KF8850FS Basic 2 hộc cân đối, inox SUS304 vân nhám chống xước, bảo hành 10 năm.",
    "images/products/site/chau-rua-bat-kluger-kf8850fs.jpg"],
  ["chau-rua-bat-kluger-kf7850fs","Chậu rửa bát Kluger KF7850FS Basic","chau-voi","Kluger","Đức",7390000,4000000,46,
    "Chậu rửa bát Kluger KF7850FS Basic 2 hộc kích thước 780x500mm, lớp chống ồn cao su, bảo hành 10 năm.",
    "images/products/site/chau-rua-bat-kluger-kf7850fs.jpg"],
  ["chau-rua-bat-kluger-ku8844fs","Chậu rửa bát Kluger KU8844FS Basic","chau-voi","Kluger","Đức",7690000,4200000,45,
    "Chậu rửa bát Kluger KU8844FS Basic 2 hộc undermount, inox 304 chống xước, đi kèm giỏ thoát nước đa năng.",
    "images/products/site/chau-rua-bat-kluger-ku8844fs.jpg"],
  ["chau-rua-bat-kluger-ku7844fs","Chậu rửa bát 1 hố Kluger KU7844FS Basic","chau-voi","Kluger","Đức",6990000,3700000,47,
    "Chậu rửa bát 1 hố Kluger KU7844FS Basic dạng undermount, lòng chậu rộng, dễ vệ sinh, bảo hành 10 năm.",
    "images/products/site/chau-rua-bat-kluger-ku7844fs.jpg"],
  ["chau-rua-bat-kluger-kg7644fb","Chậu rửa bát 1 hố Kluger KG7644FB Basic","chau-voi","Kluger","Đức",7390000,3900000,47,
    "Chậu rửa bát 1 hố Kluger KG7644FB Basic phủ nano đen sang trọng, inox SUS304 chống xước, bảo hành 10 năm.",
    "images/products/site/chau-rua-bat-kluger-kg7644fb.jpg"],
  ["chau-rua-bat-kluger-kt8050fs","Chậu rửa bát 1 hố Kluger KT8050FS Basic","chau-voi","Kluger","Đức",7890000,4300000,46,
    "Chậu rửa bát 1 hố Kluger KT8050FS Basic kích thước 800x500mm, vân nhám tinh xảo, bảo hành 10 năm.",
    "images/products/site/chau-rua-bat-kluger-kt8050fs.jpg"],
  ["chau-rua-bat-nobinox-rosa-nn974dt","Chậu rửa bát 1 hố Nobinox Rosa NN974DT","chau-voi","Nobinox","Việt Nam",7650000,6120000,20,
    "Chậu rửa bát 1 hố Nobinox Rosa NN974DT inox 304 dày 1.2mm, đáy chậu chống ồn 4 lớp, kèm giỏ thoát nước cao cấp.",
    "images/products/site/chau-rua-bat-nobinox-rosa-nn974dt.png"],
  ["chau-rua-bat-kluger-ky8045sl-plus","Chậu rửa bát 1 hố chống xước Kluger KY8045SL Plus","chau-voi","Kluger","Đức",8290000,4700000,43,
    "Chậu rửa bát 1 hố Kluger KY8045SL Plus chống xước, vân nhám sang trọng, bảo hành 10 năm chính hãng.",
    "images/products/site/chau-rua-bat-kluger-ky8045sl-plus.png"],
  ["chau-rua-bat-kluger-kg7644fs-basic","Chậu rửa bát 1 hố chống xước Kluger KG7644FS Basic","chau-voi","Kluger","Đức",6590000,3500000,47,
    "Chậu rửa bát 1 hố Kluger KG7644FS Basic kích thước 760x440mm, inox SUS304, dễ lắp đặt cho mọi căn bếp.",
    "images/products/site/chau-rua-bat-kluger-kg7644fs-basic.jpg"],
  ["chau-rua-bat-kluger-kwu8161fs-s86","Chậu rửa bát Kluger KWU8161FS-S86","chau-voi","Kluger","Đức",7590000,4700000,38,
    "Chậu rửa bát Kluger KWU8161FS-S86 chính hãng, undermount sang trọng, inox SUS304 dày dặn, bảo hành dài hạn.",
    "images/products/site/chau-rua-bat-kluger-kwu8161fs-s86.jpg"],

  ["may-loc-nuoc-ao-smith-g1","Máy Lọc Nước A.O.Smith G1","may-loc-nuoc","A.O.Smith","Mỹ",9650000,8100000,16,
    "Máy lọc nước A.O.Smith G1 công nghệ RO Side-Stream loại bỏ 99% kim loại nặng và vi khuẩn, nước uống trực tiếp tại vòi.",
    "images/products/site/may-loc-nuoc-ao-smith-g1.png"],
  ["may-loc-nuoc-ao-smith-c1","Máy Lọc Nước A.O.Smith C1","may-loc-nuoc","A.O.Smith","Mỹ",7390000,6200000,16,
    "Máy lọc nước A.O.Smith C1 công nghệ Side-Stream tiết kiệm nước, lõi UF lọc sạch giữ khoáng tự nhiên cho gia đình.",
    "images/products/site/may-loc-nuoc-ao-smith-c1.jpg"],
  ["may-loc-nuoc-ao-smith-a1","Máy lọc nước A.O.Smith A1","may-loc-nuoc","A.O.Smith","Mỹ",9300000,7810000,16,
    "Máy lọc nước A.O.Smith A1 thiết kế gọn gàng, lõi RO chính hãng, đèn báo thay lõi tự động và an toàn cho người dùng.",
    "images/products/site/may-loc-nuoc-ao-smith-a1.png"],
  ["may-loc-nuoc-ao-smith-m1","Máy lọc nước A.O.Smith M1","may-loc-nuoc","A.O.Smith","Mỹ",7390000,6430000,13,
    "Máy lọc nước A.O.Smith M1 nhỏ gọn, công nghệ Side-Stream tiết kiệm 30% nước thải, dễ thay lõi tại nhà.",
    "images/products/site/may-loc-nuoc-ao-smith-m1.png"],

  ["bo-noi-faster-comfort-4-mon","Bộ nồi Faster Comfort 4 món","bo-noi","Faster","Việt Nam",3300000,1600000,52,
    "Bộ nồi Faster Comfort 4 món inox 304 đáy từ 5 lớp, tay cầm bakelite cách nhiệt, dùng được cho mọi loại bếp.",
    "images/products/site/bo-noi-faster-comfort-4-mon.jpg"],
  ["bo-noi-latino-lt-888-ruby","Bộ Nồi Latino 6 món LT 888 Ruby","bo-noi","Latino","Hàn Quốc",3890000,1500000,61,
    "Bộ nồi Latino 6 món LT 888 Ruby phủ ngọc đỏ sang trọng, đáy từ 3 lớp truyền nhiệt nhanh, tiết kiệm điện.",
    "images/products/site/bo-noi-latino-lt-888-ruby.jpg"],
  ["bo-noi-canzy-cz-8ld-nobel","Bộ Nồi Canzy CZ-8LD NOBEL","bo-noi","Canzy","Hàn Quốc",5890000,1700000,71,
    "Bộ nồi Canzy CZ-8LD NOBEL 6 món cao cấp, đáy từ 7 lớp, nắp kính cường lực, dùng cho bếp từ và mọi loại bếp.",
    "images/products/site/bo-noi-canzy-cz-8ld-nobel.jpg"],
  ["bo-noi-chefs-eh-cw3504","Bộ Nồi Chefs 5 Món EH-CW3504","bo-noi","Chefs","Đức",2190000,1400000,36,
    "Bộ nồi Chefs 5 món EH-CW3504 inox 304 đáy từ 3 lớp, nắp kính cường lực, an toàn và bền bỉ.",
    "images/products/site/bo-noi-chefs-eh-cw3504.jpg"]
];

const products = RAW_PRODUCTS.map(function (row, index) {
  var id = row[0], name = row[1], category = row[2], brand = row[3], origin = row[4];
  var oldPrice = row[5], price = row[6], sale = row[7], description = row[8];
  var mainImage = row[9];
  var sku = id.toUpperCase().replace(/-/g, "_").slice(0, 32);
  return {
    id: id,
    name: name,
    category: category,
    brand: brand,
    origin: origin,
    sku: sku,
    status: "Còn hàng",
    is_featured: index < 8 ? 1 : 0,
    description: description,
    oldPrice: oldPrice,
    price: price,
    sale: sale,
    image: mainImage,
    images: [mainImage].concat(SUPPORT_IMAGES),
    features: _features(category),
    specs: _specs(category, brand, origin)
  };
});

if (typeof window !== "undefined") {
  window.products = products;
}
