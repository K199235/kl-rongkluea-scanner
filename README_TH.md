# KL Tracking — กล้องสแกนโรงเกลือ สำหรับ GitHub Pages

## ไฟล์ในชุด
- `index.html`: หน้าโทรศัพท์ เลือกขนส่งและดูรายการสแกน
- `style.css`: รูปแบบหน้าโทรศัพท์ ตามธีมกรมท่า–ฟ้า–เขียว
- `scanner.js`: เปิดกล้อง / อ่าน Code 128, Code 39, EAN-13, QR / พิมพ์ / สแกนหลายบิล / ลบรายการก่อนส่ง
- `GAS_Bridge_Add_To_Index.html`: โค้ด **เสริม** สำหรับเชื่อมหน้ากล้องกลับไปยัง KL Tracking (ต้องติดตั้งใน Index ของ Apps Script)

## วิธีฝากไฟล์บน GitHub
1. สร้าง Repository เช่น `kl-rongkluea-scanner` (ถ้าใช้ GitHub Pages แบบ Free โดยทั่วไป repository จะต้องเป็น Public)
2. อัปโหลด `index.html`, `style.css`, `scanner.js` ไปไว้ **root** ของ repository
3. เปิด Settings > Pages เลือก Deploy from a branch, Branch `main`, Folder `/ (root)` และ Save
4. เข้า `https://YOUR_GITHUB_USERNAME.github.io/kl-rongkluea-scanner/` บนโทรศัพท์ผ่าน HTTPS
5. เลือกขนส่ง กดเปิดกล้องและอนุญาตใช้กล้อง สแกนหลายเลขแทรคหรือพิมพ์เอง

## เชื่อมเลขแทรคเข้า KL Tracking (ไม่ให้ GitHub เขียน Master เอง)
1. สำรองไฟล์ Index.html ของ Apps Script ก่อน
2. เปิด `GAS_Bridge_Add_To_Index.html` และแทนค่า `SCANNER_URL` ด้วย GitHub Pages URL จริง
3. นำโค้ดทั้งบล็อกวางไว้ก่อน `</body>` ใน **Index.html ของ Apps Script R14.3.0/R14.3.1** (ต้องเป็นระบบที่มีเมนูโรงเกลือ)
4. Deploy Apps Script เวอร์ชันใหม่ แล้วล็อกอินเป็นผู้ใช้ที่มีสิทธิ์ออกพัสดุ
5. กด `เปิดกล้องสแกน (GitHub)` ในหน้าโรงเกลือ จากนั้นสแกนในหน้าต่าง GitHub ที่เปิดใหม่
6. กด `ส่งรายการไป KL Tracking` กลับไปตรวจว่าเลขแทรคขึ้นครบและสถานะพร้อมส่งออก แล้วกดยืนยันทั้งหมด **ใน KL Tracking เท่านั้น**

**ข้อจำกัดสำคัญ**: บางเบราว์เซอร์หรือ Google Apps Script sandbox อาจตัดความสัมพันธ์ `window.opener` ระหว่างหน้าต่าง ทำให้ `postMessage` ไม่กลับไปยัง KL Tracking และไม่มีคำรับรอง (acknowledgement) ว่ารับสำเร็จ ต้องตรวจรายการใน KL Tracking ทุกครั้ง ถ้าส่งกลับไม่ได้ ใช้ปุ่มคัดลอกเลขแทรค แล้วนำไปวางโดยวิธีที่รองรับ (โค้ดเดิมรับทีละเลขแทรค) หรือพิมพ์เอง

## ความปลอดภัย
- **GitHub Pages เป็นเว็บสาธารณะ** ห้ามใส่รหัสผ่าน Token, Spreadsheet ID ที่ไม่ควรเผยแพร่ หรือข้อมูลลูกค้าลงใน repository
- หน้านี้ไม่ติดต่อ Google Apps Script Backend โดยตรง ไม่สามารถยืนยันส่งออกจาก GitHub ได้
- ใช้ระบบ login + Backend `KL_RG_preview` / `KL_RG_confirm` เดิมเป็นผู้ตรวจสิทธิ์และบันทึกข้อมูลจริง
- สแกนและรายการอยู่ในหน่วยความจำของแท็บเท่านั้น ไม่เก็บใน localStorage หรือเซิร์ฟเวอร์ GitHub; ปิดแท็บแล้วข้อมูลอาจหาย
- ไลบรารี `html5-qrcode@2.3.8` โหลดจาก jsDelivr; ต้องมีอินเทอร์เน็ตและอาจถูกบล็อกได้ ไม่ควรใช้เวอร์ชันไม่ระบุหมายเลขใน Production
- ควรทดสอบกับโทรศัพท์จริง Android Chrome และ iPhone Safari, ความสามารถกล้อง, ตำแหน่งแสง และบาร์โค้ดจริง ก่อนใช้งานหน้างาน

## รายการที่ยังไม่ได้ทำ
- ยังไม่ได้เพิ่ม bridge เข้าไฟล์ KL Tracking ตัวจริง (ให้ทำเมื่อยืนยัน URL GitHub ที่ใช้)
- ยังไม่ได้สร้างสิทธิ์ role `rongkluea` ใน Backend: ต้องทำเพิ่มต่างหากเพื่อจำกัดให้ผู้ใช้โรงเกลือเข้าเฉพาะหน้านี้
- ยังไม่ได้ทดสอบผ่าน Google Sheets / URL Deploy จริง
- ไม่ควรถือว่าปุ่ม “ส่งรายการ” ยืนยันสถานะสำเร็จจนกว่า Backend ตอบกลับยืนยันแล้ว
