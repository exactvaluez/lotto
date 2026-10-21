// ============================================================
// ตั้งค่าการเชื่อมต่อ SUPABASE สำหรับ GitHub Pages
// วิธีดูค่าใน Supabase:
// ไปที่ Project Settings -> API -> คัดลอก Project URL และ anon public key มาใส่ด้านล่าง
// (หรือสามารถกรอกผ่านปุ่ม "ตั้งค่า Supabase" หน้าเว็บ Login ได้โดยตรง)
// ============================================================
window.SUPABASE_CONFIG = {
    url: (localStorage.getItem('LOTTO_SUPABASE_URL') || 'https://qzdzrcwrugqjssagpfpr.supabase.co').replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, ''),
    anonKey: localStorage.getItem('LOTTO_SUPABASE_KEY') || 'ใส่_SUPABASE_ANON_KEY_ที่นี่'
};
