# KL RongKluea Camera-Only — R14.3.8

## สิ่งที่เปลี่ยน
GitHub Pages เป็นเพียงกล้องสดอ่านบาร์โค้ด ไม่มีหน้าเลือกขนส่ง, ไม่มีรายการพัสดุ, ไม่มีปุ่มยืนยันส่งออก, ไม่ฝัง Google Sheets ID, ไม่ฝัง Session Token. ผู้ที่เปิดหน้า Public ด้วยตัวเองอ่านบาร์โค้ดได้เฉพาะบนอุปกรณ์ของตัวเองเท่านั้น

## อัปเดต GitHub
1. ใน Repository `K199235/kl-rongkluea-scanner` ให้แทนไฟล์ **ทั้งสามไฟล์** `index.html`, `style.css`, `scanner.js` จาก ZIP ชุดนี้ (อย่าอัปโหลด Code.gs หรือ Backend)
2. Commit changes แล้วเปิด https://k199235.github.io/kl-rongkluea-scanner/ ตรวจว่ามีเพียงกล้องและอ่านล่าสุด
3. Repository ยัง Public จึงเปิดหน้าเครื่องสแกนได้ทุกคน แต่ไม่มีฟังก์ชันบันทึกธุรกิจ

## อัปเดต Google Apps Script
1. สำรอง HTML หลักก่อน
2. ใช้ `KL_Tracking_Index_R14_3_8_Camera_Only_Bridge.html` แทน HTML หลัก (ใช้ Backend R14.3.7 เดิม)
3. ห้ามรวม Bridge เวอร์ชันเก่าซ้อนกับตัวเชื่อม R14.3.8; ถ้ามีไฟล์ GAS_Bridge แยกเป็นไฟล์เฉย ๆ ที่ไม่ถูก include ไม่ต้องลบ แต่ถ้ามีการ include สคริปต์เก่า ต้องปิดการ include ก่อน
4. Deploy เวอร์ชันใหม่
5. ล็อกอินด้วย `rongkluea` หรือ `super`, เลือกขนส่งที่หน้า KL Tracking, กดปุ่มเปิดกล้อง, อ่านเลขทดสอบ กลับมาดูว่ารายการถูกเพิ่มในหน้าที่ล็อกอิน แล้วตรวจสถานะจาก Backend
6. อย่าเพิ่งกดยืนยันส่งออกจริง จนกว่าจะผ่านการทดสอบบนสำเนา Google Sheets

## ความปลอดภัย
- สคริปต์ Public ไม่มีคำสั่ง `google.script.run`, ไม่มี URL /exec หรือ Token และไม่เข้าถึง Sheets
- `postMessage` ส่งแค่ข้อความเลขแทรคจากหน้ากล้องกลับหน้าที่เปิดกล้อง หากเปิดเว็บไซต์ Scanner โดยตรงจะไม่เชื่อม KL Tracking
- ฝั่ง Google Apps Script ตรวจ origin, หน้าต่างที่เปิด และ session/role ก่อนเพิ่มเลขเข้า UI
- API ใน Backend ต้องตรวจสิทธิ์ทุกครั้ง และต้องทดสอบการเรียกโดยไม่มีสิทธิ์แยกต่างหาก (ยังไม่ได้ทดสอบจริง)
- Browser popup blockers หรือการข้ามโดเมนยังอาจทำให้การส่งเลขกลับไม่ได้ ต้องทดสอบจริงบนโทรศัพท์
