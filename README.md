**ชื่อ-นามสกุล: วิชญ์พล ยืนยง**
**รหัสนักศึกษา: 653450103-3**

โปรเจกต์นี้เป็นแอปตัวอย่างที่พัฒนาด้วย **Expo + React Native (TypeScript)** เพื่อเชื่อมกับ **CIS KKU Classroom API** และมีฟังก์ชันหลักดังนี้:

## ฟังก์ชันหลัก

จงสร้างเว็บแอพพลิเคชั่นโดยมีฟังก์ชั่นการทำงานต่อไปนี้

1. ฟังก์ชั่นล๊อกอินเข้าสู่ระบบ
2. ฟังชั่นดูสมาชิกในชั้นปี ตามปีที่เข้าศึกษา

curl -X 'GET' \
 'https://cis.kku.ac.th/api/classroom/class/2565' \

3. ฟังก์ชั่นโพสต์สถานะ
4. ฟังก์ชั่นคอมเม้นท์สถานะ
5. ฟังก์ชั่น like and unlike สถานะ

---

## รูปตัวอย่างผลงาน

![หน้า login](assets/images/work/login.png)
![หน้า main](assets/images/work/main.png)
![หน้า feed](assets/images/work/feed.png)
![หน้า members](assets/images/work/members.png)
![หน้า profile](assets/images/work/profile.png)

---

## ติดตั้ง

npx create-expo-app todo-mobile-app
cd todo-mobile-app

## package

npm install @react-navigation/native @react-navigation/native-stack
npm install react-native-screens react-native-safe-area-context
npm install axios
npm install lucide-react-native

## รัน

โปรเเกรม
npx expo start -c
