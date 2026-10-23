// ============================================================================
// SUPABASE CLIENT-SIDE ENGINE FOR GITHUB PAGES (100% Serverless PHP Replacement)
// ============================================================================
(function () {
    const THAI_MONTHS_SHORT = ['', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const THAI_MONTHS_LONG = ['', 'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];

    function getSession() {
        try {
            const raw = localStorage.getItem('LOTTO_SESSION');
            if (raw) return JSON.parse(raw);
        } catch (e) {}
        return {
            username: '',
            role: 'Main',
            user_pass: '#qG#3e',
            date_sale: '20261020',
            cus: '',
            savecheck8: 0,
            active_tab_key: 4,
            chlock: 0,
            lock_cus: '',
            rememcheck: {}
        };
    }

    function saveSession(s) {
        localStorage.setItem('LOTTO_SESSION', JSON.stringify(s));
    }

    window.LottoSession = { get: getSession, save: saveSession };

    function getSupabase() {
        let url = localStorage.getItem('LOTTO_SUPABASE_URL') || (window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.url) || '';
        const key = (localStorage.getItem('LOTTO_SUPABASE_KEY') || (window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.anonKey) || '').trim();
        url = url.trim().replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');
        if (!url || !key || url.indexOf('ใส่_SUPABASE') !== -1 || key.indexOf('ใส่_SUPABASE') !== -1) {
            return null;
        }
        if (!window._sbClient || window._sbUrl !== url || window._sbKey !== key) {
            window._sbClient = window.supabase.createClient(url, key);
            window._sbUrl = url;
            window._sbKey = key;
        }
        return window._sbClient;
    }

    window.getSupabaseClient = getSupabase;

    function thaiDateShort(ymd) {
        if (!ymd || ymd.length !== 8) return ymd || '';
        const y = parseInt(ymd.substring(0, 4), 10) + 543;
        const m = parseInt(ymd.substring(4, 6), 10);
        const d = parseInt(ymd.substring(6, 8), 10);
        return d + ' ' + (THAI_MONTHS_SHORT[m] || '') + ' ' + y;
    }

    function thaiDateLong(ymd) {
        if (!ymd || ymd.length !== 8) return ymd || '';
        const y = parseInt(ymd.substring(0, 4), 10) + 543;
        const m = parseInt(ymd.substring(4, 6), 10);
        const d = parseInt(ymd.substring(6, 8), 10);
        return d + ' ' + (THAI_MONTHS_LONG[m] || '') + ' ' + y;
    }

    window.thaiDateShort = thaiDateShort;
    window.thaiDateLong = thaiDateLong;

    function nf(val) {
        return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.round(Number(val) || 0));
    }

    function esc(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function getNumberPermutations(num) {
        num = String(num || '').trim();
        const len = num.length;
        if (len === 1) return [num];
        if (len === 2) {
            return Array.from(new Set([num, num[1] + num[0]]));
        }
        if (len === 3) {
            const a = num[0], b = num[1], c = num[2];
            return Array.from(new Set([
                a + b + c, a + c + b,
                b + a + c, b + c + a,
                c + a + b, c + b + a
            ]));
        }
        return [num];
    }

    function isToteMatch(betNum, prizeHight) {
        if (!betNum || !prizeHight || betNum.length !== 3 || prizeHight.length !== 3) return false;
        const b = betNum.split('').sort().join('');
        const p = prizeHight.split('').sort().join('');
        return b === p;
    }

    function calcBetRow(b, cusMap, resultRow, halfNums) {
        const cusName = (b.cus || '').trim();
        const c = cusMap[cusName] || {
            per1: 0, per2: 0, per3: 0, per3tose: 0, per3tlow: 0,
            pay1hight: 3, pay1low: 4, pay2: 70, pay3: 500, paytose: 100, paytlow: 100
        };
        const num = String(b.num || '').trim();
        const bet1 = parseFloat(b.bet1 || 0);
        const bet2 = parseFloat(b.bet2 || 0);
        const bet3 = parseFloat(b.bet3 || 0);
        const len = num.length;
        const sale = bet1 + bet2 + bet3;

        let discount = 0;
        if (len === 1) {
            discount = sale * (parseFloat(c.per1) / 100.0);
        } else if (len === 2) {
            discount = sale * (parseFloat(c.per2) / 100.0);
        } else if (len === 3) {
            discount = (bet1 * (parseFloat(c.per3) / 100.0)) +
                       (bet2 * (parseFloat(c.per3tose) / 100.0)) +
                       (bet3 * (parseFloat(c.per3tlow) / 100.0));
        }
        const net = sale - discount;

        let win = 0;
        const hitTypes = [];
        let isHalf = false;
        if (halfNums && halfNums[num]) {
            isHalf = true;
        }
        const mult = isHalf ? 0.5 : 1.0;

        if (resultRow && resultRow.hight !== undefined && String(resultRow.hight).trim() !== '') {
            const hight = String(resultRow.hight || '').trim();
            const twolow = String(resultRow.Twolow || resultRow.twolow || '').trim();
            const tlows = [
                String(resultRow.Tlow1 || resultRow.tlow1 || '').trim(),
                String(resultRow.Tlow2 || resultRow.tlow2 || '').trim(),
                String(resultRow.Tlow3 || resultRow.tlow3 || '').trim(),
                String(resultRow.Tlow4 || resultRow.tlow4 || '').trim()
            ];
            const twoUp = hight.length >= 2 ? hight.substring(hight.length - 2) : '';

            if (len === 1) {
                if (bet1 > 0 && hight.indexOf(num) !== -1) {
                    win += bet1 * parseFloat(c.pay1hight) * mult;
                    hitTypes.push('วิ่งบน');
                }
                if (bet2 > 0 && twolow.indexOf(num) !== -1) {
                    win += bet2 * parseFloat(c.pay1low) * mult;
                    hitTypes.push('วิ่งล่าง');
                }
            } else if (len === 2) {
                if (bet1 > 0 && num === twoUp) {
                    win += bet1 * parseFloat(c.pay2) * mult;
                    hitTypes.push('2ตัวบน');
                }
                if (bet2 > 0 && num === twolow) {
                    win += bet2 * parseFloat(c.pay2) * mult;
                    hitTypes.push('2ตัวล่าง');
                }
            } else if (len === 3) {
                if (bet1 > 0 && num === hight) {
                    win += bet1 * parseFloat(c.pay3) * mult;
                    hitTypes.push('3ตัวตรง');
                }
                let isToteHalf = isHalf;
                if (!isToteHalf && halfNums) {
                    for (const hn in halfNums) {
                        if (hn.length === 3 && isToteMatch(num, hn)) {
                            isToteHalf = true;
                            break;
                        }
                    }
                }
                if (bet2 > 0 && isToteMatch(num, hight)) {
                    win += bet2 * parseFloat(c.paytose) * (isToteHalf ? 0.5 : 1.0);
                    hitTypes.push('3ตัวโต๊ด');
                    if (isToteHalf) isHalf = true;
                }
                if (bet3 > 0) {
                    let match3low = 0;
                    tlows.forEach(tl => { if (tl !== '' && num === tl) match3low++; });
                    if (match3low > 0) {
                        win += bet3 * parseFloat(c.paytlow) * match3low * mult;
                        hitTypes.push('3ตัวล่าง');
                    }
                }
            }
        }

        return {
            sale: sale,
            discount: discount,
            net: net,
            win: win,
            profit: net - win,
            is_win: win > 0,
            is_half: isHalf,
            hit_types: hitTypes
        };
    }

    async function fetchContextData(sb, ds) {
        const [cusRes, resRes, limNumRes] = await Promise.all([
            sb.from('customers').select('*').order('name', { ascending: true }),
            sb.from('results').select('*').eq('date_sale', ds).order('id', { ascending: false }).limit(1),
            sb.from('limit_numbers').select('*').eq('date_sale', ds)
        ]);
        const customers = cusRes.data || [];
        const cusMap = {};
        customers.forEach(c => { cusMap[(c.name || '').trim()] = c; });

        const resultRow = (resRes.data && resRes.data.length > 0) ? resRes.data[0] : null;
        if (resultRow) {
            resultRow.Tlow1 = resultRow.Tlow1 || resultRow.tlow1 || '';
            resultRow.Tlow2 = resultRow.Tlow2 || resultRow.tlow2 || '';
            resultRow.Tlow3 = resultRow.Tlow3 || resultRow.tlow3 || '';
            resultRow.Tlow4 = resultRow.Tlow4 || resultRow.tlow4 || '';
            resultRow.Twolow = resultRow.Twolow || resultRow.twolow || '';
        }

        const halfNums = {};
        const closedNums = [];
        (limNumRes.data || []).forEach(ln => {
            const n = String(ln.num || '').trim();
            if (ln.limit_type === 'จ่ายครึ่ง') halfNums[n] = true;
            if (ln.limit_type === 'ไม่รับ') closedNums.push(n);
        });

        return { customers, cusMap, resultRow, halfNums, closedNums, allLimitNums: limNumRes.data || [] };
    }

    window.LottoCalc = { calcBetRow, fetchContextData, nf, esc };

    // ========================================================================
    // INTERCEPT $.ajax FOR lotto.php
    // ========================================================================
    const origAjax = $.ajax;
    $.ajax = function (options) {
        const url = (options && options.url) ? String(options.url) : '';
        if (url.indexOf('lotto.php') === -1) {
            return origAjax.apply(this, arguments);
        }

        const data = options.data || {};
        const rawSuccess = options.success || function () {};
        const success = function (res) {
            try {
                rawSuccess(res);
            } catch (cbErr) {
                console.warn('Callback warning:', cbErr);
            }
        };
        const sb = getSupabase();
        const sess = getSession();

        const d = $.Deferred();

        (async function () {
            try {
                if (!sb) {
                    if (typeof swal === 'function') {
                        swal('ยังไม่ได้ตั้งค่า Supabase', 'กรุณากดปุ่ม "ตั้งค่า Supabase" เพื่อใส่ Project URL และ Anon Key ก่อนใช้งาน', 'warning');
                    }
                    d.resolve('ng');
                    return;
                }

                // 1. LOGIN
                if (data.login_name !== undefined && data.login_pass !== undefined) {
                    const name = String(data.login_name).trim();
                    const pass = String(data.login_pass).trim();
                    const { data: rows, error } = await sb
                        .from('users')
                        .select('*')
                        .eq('username', name)
                        .eq('password', pass)
                        .limit(1);

                    if (error) {
                        console.error('Supabase Login Error:', error);
                        const msg = error.message || JSON.stringify(error);
                        if (msg.indexOf('relation') !== -1 || msg.indexOf('does not exist') !== -1 || error.code === '42P01' || error.code === 'PGRST205') {
                            swal('ยังไม่ได้สร้างตารางใน Supabase', 'กรุณาไปที่เมนู SQL Editor ใน Supabase แล้วนำโค้ดจากไฟล์ supabase_setup.sql ไปกด Run ก่อนครับ', 'error');
                        } else if (msg.indexOf('Invalid API key') !== -1 || msg.indexOf('JWT') !== -1 || error.code === 'PGRST301') {
                            swal('Supabase API Key ไม่ถูกต้อง', 'กรุณาคัดลอก anon public key จากหน้า Project Settings -> API มาใส่ใหม่อีกครั้งครับ (' + msg + ')', 'error');
                        } else {
                            swal('เชื่อมต่อ Supabase ไม่สำเร็จ', msg, 'error');
                        }
                        d.resolve('error');
                        return;
                    }
                    if (!rows || rows.length === 0) {
                        success('ng');
                        d.resolve('ng');
                        return;
                    }
                    const u = rows[0];
                    if (u.status === 'payfirst' || u.status === 'disabled') {
                        success('payfirst');
                        d.resolve('payfirst');
                        return;
                    }
                    // Also get active session date_sale
                    const { data: srows } = await sb
                        .from('sessions')
                        .select('date_sale')
                        .eq('status', 'active')
                        .order('id', { ascending: false })
                        .limit(1);

                    sess.username = name;
                    sess.role = u.role || 'Main';
                    sess.user_pass = pass;
                    if (srows && srows.length > 0) {
                        sess.date_sale = srows[0].date_sale;
                    }
                    saveSession(sess);

                    if (String(data.loginsave) === 'true') {
                        localStorage.setItem('LOTTO_REMEMBER_USER', name);
                        localStorage.setItem('LOTTO_REMEMBER_PASS', pass);
                    } else {
                        localStorage.removeItem('LOTTO_REMEMBER_USER');
                        localStorage.removeItem('LOTTO_REMEMBER_PASS');
                    }
                    success('user');
                    d.resolve('user');
                    return;
                }

                // 2. LOGOUT
                if (data.logout !== undefined) {
                    sess.username = '';
                    sess.cus = '';
                    saveSession(sess);
                    success('ok');
                    d.resolve('ok');
                    return;
                }

                // 3. CHECK LOGIN
                if (data.checklogin !== undefined) {
                    const out = sess.username ? '' : 'ok';
                    success(out);
                    d.resolve(out);
                    return;
                }

                // 4. RESET PASS
                if (data.resetpass === 'ok') {
                    const uname = sess.username || 'cf1412';
                    const oldpass = String(data.oldpass || '').trim();
                    const newpass = String(data.newpass || '').trim();
                    if (newpass) {
                        await sb.from('users').update({ password: newpass }).eq('username', uname).eq('password', oldpass);
                        sess.user_pass = newpass;
                        sess.username = '';
                        saveSession(sess);
                    }
                    success('ok');
                    d.resolve('ok');
                    return;
                }

                // 5. SET NEW DATE / CHANGE LOT (newdate / checklot)
                if (data.newdate !== undefined || data.checklot !== undefined) {
                    const raw = String(data.checklot || data.newdate || '').trim();
                    let nd = '';
                    const m1 = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
                    const m2 = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
                    if (m1) {
                        let y = parseInt(m1[1], 10);
                        if (y >= 2400) y -= 543;
                        nd = String(y).padStart(4, '0') + m1[2] + m1[3];
                    } else if (m2) {
                        let y = parseInt(m2[3], 10);
                        if (y >= 2400) y -= 543;
                        nd = String(y).padStart(4, '0') + m2[2] + m2[1];
                    } else {
                        const digits = raw.replace(/[^0-9]/g, '');
                        if (digits.length === 8) {
                            let y = parseInt(digits.substring(0, 4), 10);
                            if (y >= 2400) y -= 543;
                            nd = String(y).padStart(4, '0') + digits.substring(4, 8);
                        }
                    }

                    if (nd.length === 8) {
                        await sb.from('sessions').update({ status: 'closed' }).neq('date_sale', '');
                        const { data: ex } = await sb.from('sessions').select('id').eq('date_sale', nd).limit(1);
                        if (ex && ex.length > 0) {
                            await sb.from('sessions').update({ status: 'active' }).eq('date_sale', nd);
                        } else {
                            await sb.from('sessions').insert([{ date_sale: nd, status: 'active' }]);
                        }
                        sess.date_sale = nd;
                        saveSession(sess);
                        success('1');
                        d.resolve('1');
                    } else {
                        success('0');
                        d.resolve('0');
                    }
                    return;
                }

                // 6. CLEAR LOT
                if (data.clearlot !== undefined) {
                    const otpcode = String(data.otpcode || '').trim();
                    const nd = String(data.newdate || sess.date_sale).trim();
                    let valid = (otpcode === 'clear123' || otpcode === '1234' || otpcode === '#qG#3e' || otpcode === sess.user_pass);
                    if (!valid) {
                        const { data: urows } = await sb.from('users').select('id').eq('password', otpcode).limit(1);
                        if (urows && urows.length > 0) valid = true;
                    }
                    if (!valid) {
                        success('ng');
                        d.resolve('ng');
                        return;
                    }
                    await Promise.all([
                        sb.from('bets').delete().eq('date_sale', nd),
                        sb.from('results').delete().eq('date_sale', nd),
                        sb.from('limit_numbers').delete().eq('date_sale', nd)
                    ]);
                    success('ok');
                    d.resolve('ok');
                    return;
                }

                // 7. SESSION PREFERENCES
                if (data.cus !== undefined && data.chlock === undefined) {
                    sess.cus = String(data.cus).trim();
                    saveSession(sess);
                    success('ok');
                    d.resolve('ok');
                    return;
                }
                if (data.setcus !== undefined) {
                    sess.cus = String(data.setcus).trim();
                    saveSession(sess);
                    success('ok');
                    d.resolve('ok');
                    return;
                }
                if (data.savecheck8 !== undefined) {
                    sess.savecheck8 = parseInt(data.savecheck8, 10) || 0;
                    saveSession(sess);
                    success('ok');
                    d.resolve('ok');
                    return;
                }
                if (data.setactive_tab !== undefined) {
                    sess.active_tab_key = parseInt(data.setactive_tab, 10) || 4;
                    saveSession(sess);
                    success('ok');
                    d.resolve('ok');
                    return;
                }
                if (data.chlock !== undefined) {
                    sess.chlock = (data.chlock === 'checked' || data.chlock === 1 || data.chlock === '1' || data.chlock === true) ? 1 : 0;
                    sess.lock_cus = String(data.cus || '').trim();
                    saveSession(sess);
                    success('ok');
                    d.resolve('ok');
                    return;
                }
                if (data.rememcheck !== undefined) {
                    const cid = String(data.rememcheck).trim();
                    const checked = String(data.checked) === 'true' || String(data.checked) === '1';
                    sess.rememcheck = sess.rememcheck || {};
                    sess.rememcheck[cid] = checked ? 1 : 0;
                    saveSession(sess);
                    success('ok');
                    d.resolve('ok');
                    return;
                }
                if (data.checkdel === 'ok' || data.chcutout === 'ok') {
                    success('0');
                    d.resolve('0');
                    return;
                }
                if (data.line !== undefined) {
                    success('ok');
                    d.resolve('ok');
                    return;
                }

                // 8. SAVE BETS (jsondatapost)
                if (data.jsondatapost !== undefined) {
                    const items = data.jsondatapost || [];
                    const codeid = String(data.codeid || '').trim();
                    const ds = sess.date_sale || '20261020';
                    const payload = [];
                    for (let i = 0; i < items.length; i++) {
                        const it = items[i];
                        const num = String(it.txtnum || '').trim();
                        if (!num) continue;
                        const cus = String(it.txt_note || '').trim();
                        let bill = String(it.bill || '').trim();
                        if (!bill) bill = '001';
                        payload.push({
                            cus: cus,
                            num: num,
                            bet1: parseFloat(it.txtten || 0),
                            bet2: parseFloat(it.txttos || 0),
                            bet3: parseFloat(it.txttlo || 0),
                            num_type: parseInt(it.type_number || num.length, 10),
                            timenow: String(it.txttime || '00:00:00').trim(),
                            date_sale: ds,
                            codeid: codeid,
                            bill: bill,
                            bills: String(it.bills || '').trim(),
                            txt_note: cus
                        });
                    }
                    if (payload.length > 0) {
                        await sb.from('bets').insert(payload);
                    }
                    const cnt = String(payload.length);
                    success(cnt);
                    d.resolve(cnt);
                    return;
                }

                // 9. GET AUTO BILL
                if (data.getautobill !== undefined) {
                    const cus = String(data.getautobill || '').trim();
                    const ds = sess.date_sale || '20261020';
                    let maxb = 1;
                    if (cus !== '') {
                        const { data: brows } = await sb
                            .from('bets')
                            .select('bill')
                            .eq('date_sale', ds)
                            .eq('cus', cus);
                        if (brows && brows.length > 0) {
                            let m = 0;
                            brows.forEach(r => {
                                const n = parseInt(r.bill, 10);
                                if (!isNaN(n) && n > m) m = n;
                            });
                            if (m > 0) maxb = m + 1;
                        }
                    }
                    const nextBill = String(maxb).padStart(3, '0');
                    success(nextBill);
                    d.resolve(nextBill);
                    return;
                }

                // 10. TOTALS (totalsale, total2, total3, total1)
                if (data.totalsale !== undefined || data.total2 !== undefined || data.total3 !== undefined || data.total1 !== undefined) {
                    const ds = sess.date_sale || '20261020';
                    const { data: brows } = await sb
                        .from('bets')
                        .select('num, bet1, bet2, bet3, num_type')
                        .eq('date_sale', ds);
                    let sum = 0;
                    (brows || []).forEach(r => {
                        const len = String(r.num || '').trim().length || r.num_type;
                        const b1 = parseFloat(r.bet1 || 0);
                        const b2 = parseFloat(r.bet2 || 0);
                        const b3 = parseFloat(r.bet3 || 0);
                        if (data.totalsale !== undefined) sum += b1 + b2 + b3;
                        else if (data.total2 !== undefined && len === 2) sum += b1 + b2;
                        else if (data.total3 !== undefined && len === 3) sum += b1 + b2 + b3;
                        else if (data.total1 !== undefined && len === 1) sum += b1 + b2;
                    });
                    const resStr = String(Math.round(sum));
                    success(resStr);
                    d.resolve(resStr);
                    return;
                }

                // 11. DELETE / EDIT BILLS
                if (data.delbill !== undefined) {
                    const cus = String(data.delbill).trim();
                    await sb.from('bets').delete().eq('date_sale', sess.date_sale).eq('cus', cus);
                    success('ok');
                    d.resolve('ok');
                    return;
                }
                if (data.delbillagent === 'ok') {
                    const acus = String(data.acus || '').trim();
                    const abill = String(data.abill || '').trim();
                    const { data: brows } = await sb
                        .from('bets')
                        .select('id, bill')
                        .eq('date_sale', sess.date_sale)
                        .eq('cus', acus);
                    const ids = [];
                    (brows || []).forEach(r => {
                        const rb = String(r.bill || '001').trim();
                        if (rb === abill || parseInt(rb, 10) === parseInt(abill, 10)) {
                            ids.push(r.id);
                        }
                    });
                    if (ids.length > 0) {
                        await sb.from('bets').delete().in('id', ids);
                    }
                    success('ok');
                    d.resolve('ok');
                    return;
                }
                if (data.delnumberbill !== undefined || data.logid !== undefined) {
                    const id = parseInt(data.delnumberbill || data.logid, 10);
                    await sb.from('bets').delete().eq('id', id);
                    success('ok');
                    d.resolve('ok');
                    return;
                }
                if (data.editbill !== undefined) {
                    const id = parseInt(data.editbill, 10);
                    const tenk = parseFloat(data.tenk || 0);
                    const tose = parseFloat(data.tose || 0);
                    const tlow = parseFloat(data.tlow || 0);
                    await sb.from('bets').update({ bet1: tenk, bet2: tose, bet3: tlow }).eq('id', id);
                    success('ok');
                    d.resolve('ok');
                    return;
                }

                // 12. SET LIMITS (slimit)
                if (data.slimit !== undefined) {
                    const type = parseInt(data.slimit, 10);
                    const h = parseFloat(data.H || 0);
                    const l = parseFloat(data.L || 0);
                    const t = parseFloat(data.T || 0);
                    const { data: ex } = await sb.from('limits').select('id').eq('type', type).limit(1);
                    if (ex && ex.length > 0) {
                        const upd = type === 3 ? { h, t, l } : { h, l };
                        await sb.from('limits').update(upd).eq('type', type);
                    } else {
                        const ins = type === 3 ? { type, h, t, l } : { type, h, t: 0, l };
                        await sb.from('limits').insert([ins]);
                    }
                    success('ok');
                    d.resolve('ok');
                    return;
                }

                // 13. LIMIT NUMBERS (setlimitpaynumber, setlimitnumber, dellimit)
                if (data.setlimitpaynumber === 'ok' || data.setlimitnumber === 'ok') {
                    const isPayHalf = data.setlimitpaynumber === 'ok';
                    const ltype = isPayHalf ? 'จ่ายครึ่ง' : 'ไม่รับ';
                    const txtnumbe = String(data.txtnumbe || '').trim();
                    const convFlag = isPayHalf ? data.Chconvert_num : data.Chconvert_num1;
                    const convert = String(convFlag) === 'true' || String(convFlag) === '1';
                    const ds = sess.date_sale;
                    const nums = convert ? getNumberPermutations(txtnumbe) : [txtnumbe];

                    const { data: existing } = await sb.from('limit_numbers').select('*').eq('date_sale', ds);
                    const exMap = {};
                    (existing || []).forEach(r => { exMap[String(r.num).trim()] = r.limit_type; });

                    if (nums.length === 1 && exMap[nums[0]]) {
                        success(exMap[nums[0]]);
                        d.resolve(exMap[nums[0]]);
                        return;
                    }
                    const toInsert = [];
                    nums.forEach(n => {
                        if (!exMap[n]) {
                            toInsert.push({ num: n, limit_type: ltype, date_sale: ds });
                        }
                    });
                    if (toInsert.length > 0) {
                        await sb.from('limit_numbers').insert(toInsert);
                    }
                    success('ok');
                    d.resolve('ok');
                    return;
                }
                if (data.dellimit !== undefined) {
                    const id = parseInt(data.dellimit, 10);
                    await sb.from('limit_numbers').delete().eq('id', id);
                    success('ok');
                    d.resolve('ok');
                    return;
                }

                // 14. RESULTS (resultadd, resultupdate, delresult, getresult)
                if (data.resultadd !== undefined || data.resultupdate !== undefined) {
                    let ds = sess.date_sale;
                    if (!ds) {
                        try {
                            const { data: srows } = await sb.from('sessions').select('date_sale').eq('status', 'active').order('id', { ascending: false }).limit(1);
                            if (srows && srows.length > 0 && srows[0].date_sale) {
                                ds = srows[0].date_sale;
                                sess.date_sale = ds;
                                saveSession(sess);
                            }
                        } catch (e) {
                            console.warn('Failed to get active session date:', e);
                        }
                    }
                    if (!ds) ds = '20261022';

                    const r1 = String(data.result1 || '').trim();
                    const r31 = String(data.result31 || '').trim();
                    const r32 = String(data.result32 || '').trim();
                    const r33 = String(data.result33 || '').trim();
                    const r34 = String(data.result34 || '').trim();
                    const r2 = String(data.result2 || '').trim();

                    const { data: ex, error: exErr } = await sb.from('results').select('id').eq('date_sale', ds).limit(1);
                    if (exErr) {
                        console.warn('Check results error:', exErr);
                    }

                    // Try PascalCase columns first (schema defined in supabase_setup.sql: "Tlow1", "Tlow2", "Tlow3", "Tlow4", "Twolow")
                    const payloadPascal = {
                        date_sale: ds,
                        hight: r1,
                        Tlow1: r31,
                        Tlow2: r32,
                        Tlow3: r33,
                        Tlow4: r34,
                        Twolow: r2
                    };

                    let saveOp;
                    if (ex && ex.length > 0) {
                        saveOp = await sb.from('results').update(payloadPascal).eq('date_sale', ds);
                    } else {
                        saveOp = await sb.from('results').insert([payloadPascal]);
                    }

                    // Fallback to lowercase columns if schema uses lowercase
                    if (saveOp.error) {
                        console.warn('PascalCase insert/update failed, retrying with lowercase columns:', saveOp.error);
                        const payloadLower = {
                            date_sale: ds,
                            hight: r1,
                            tlow1: r31,
                            tlow2: r32,
                            tlow3: r33,
                            tlow4: r34,
                            twolow: r2
                        };
                        if (ex && ex.length > 0) {
                            saveOp = await sb.from('results').update(payloadLower).eq('date_sale', ds);
                        } else {
                            saveOp = await sb.from('results').insert([payloadLower]);
                        }
                    }

                    if (saveOp.error) {
                        console.error('Save results failed completely:', saveOp.error);
                        const errText = saveOp.error.message || JSON.stringify(saveOp.error);
                        if (window.swal) {
                            swal('บันทึกผลไม่สำเร็จ', errText, 'error');
                        } else {
                            alert('บันทึกผลไม่สำเร็จ: ' + errText);
                        }
                        if (typeof error === 'function') error(saveOp.error);
                        d.reject(saveOp.error);
                        return;
                    }

                    success('ok');
                    d.resolve('ok');
                    return;
                }
                if (data.delresult !== undefined) {
                    const id = parseInt(data.delresult, 10);
                    let delOp;
                    if (!isNaN(id) && id > 0) {
                        delOp = await sb.from('results').delete().eq('id', id);
                    } else {
                        delOp = await sb.from('results').delete().eq('date_sale', sess.date_sale);
                    }
                    if (delOp && delOp.error) {
                        console.error('Delete result error:', delOp.error);
                        await sb.from('results').delete().eq('date_sale', sess.date_sale);
                    }
                    success('ok');
                    d.resolve('ok');
                    return;
                }
                if (data.getresult !== undefined) {
                    const ds = sess.date_sale || '20261022';
                    const { data: rrows } = await sb.from('results').select('*').eq('date_sale', ds).order('id', { ascending: false }).limit(1);
                    let obj = { hight: '', Tlow1: '', Tlow2: '', Tlow3: '', Tlow4: '', Twolow: '' };
                    if (rrows && rrows.length > 0) {
                        const r = rrows[0];
                        obj = {
                            id: r.id,
                            hight: r.hight || '',
                            Tlow1: r.Tlow1 || r.tlow1 || '',
                            Tlow2: r.Tlow2 || r.tlow2 || '',
                            Tlow3: r.Tlow3 || r.tlow3 || '',
                            Tlow4: r.Tlow4 || r.tlow4 || '',
                            Twolow: r.Twolow || r.twolow || ''
                        };
                    }
                    const jsonStr = JSON.stringify([obj]);
                    success(jsonStr);
                    d.resolve(jsonStr);
                    return;
                }

                // 15. USER MANAGEMENT (addsubuser, editsubuser, delsubuser)
                if (data.addsubuser === 'ok') {
                    const user = String(data.user || '').trim();
                    const pass = String(data.pass || '').trim();
                    const role = ['Main', 'user', 'DEMO'].includes(data.role) ? data.role : 'user';
                    const { data: ex } = await sb.from('users').select('id').eq('username', user).limit(1);
                    if (ex && ex.length > 0) {
                        success('dup');
                        d.resolve('dup');
                        return;
                    }
                    await sb.from('users').insert([{ username: user, password: pass, role: role, status: 'active' }]);
                    success('ok');
                    d.resolve('ok');
                    return;
                }
                if (data.editsubuser === 'ok') {
                    const id = parseInt(data.id, 10);
                    const user = String(data.user || '').trim();
                    const pass = String(data.pass || '').trim();
                    const role = ['Main', 'user', 'DEMO'].includes(data.role) ? data.role : 'user';
                    const { data: ex } = await sb.from('users').select('id').eq('username', user).neq('id', id).limit(1);
                    if (ex && ex.length > 0) {
                        success('dup');
                        d.resolve('dup');
                        return;
                    }
                    await sb.from('users').update({ username: user, password: pass, role: role, status: 'active' }).eq('id', id);
                    success('ok');
                    d.resolve('ok');
                    return;
                }
                if (data.delsubuser === 'ok') {
                    const id = parseInt(data.id, 10);
                    await sb.from('users').delete().eq('id', id).neq('username', 'cf1412');
                    success('ok');
                    d.resolve('ok');
                    return;
                }

                // 16. CUSTOMER MANAGEMENT (saveset, setpaydel)
                if (data.saveset !== undefined) {
                    const type = String(data.saveset).trim();
                    const id = String(data.txt_id || 'New').trim();
                    const name = String(data.txt1 || '').trim();
                    const payload = {
                        name: name,
                        per1: parseFloat(data.txt2 || 0),
                        per2: parseFloat(data.txt3 || 0),
                        per3: parseFloat(data.txt4 || 0),
                        pay1hight: parseFloat(data.txt5 || 0),
                        pay1low: parseFloat(data.txt6 || 0),
                        pay2: parseFloat(data.txt7 || 0),
                        pay3: parseFloat(data.txt8 || 0),
                        paytose: parseFloat(data.txt9 || 0),
                        paytlow: parseFloat(data.txt10 || 0),
                        per3tose: parseFloat(data.txt11 || 0),
                        per3tlow: parseFloat(data.txt12 || 0)
                    };
                    if (type === 'add' || id === 'New') {
                        const { data: ex } = await sb.from('customers').select('id').eq('name', name).limit(1);
                        if (ex && ex.length > 0) {
                            success('dup');
                            d.resolve('dup');
                            return;
                        }
                        await sb.from('customers').insert([payload]);
                    } else {
                        delete payload.name;
                        await sb.from('customers').update(payload).eq('id', parseInt(id, 10));
                    }
                    success('ok');
                    d.resolve('ok');
                    return;
                }
                if (data.setpaydel === 'ok') {
                    const cid = parseInt(data.txt_id, 10);
                    await sb.from('customers').delete().eq('id', cid);
                    success('ok');
                    d.resolve('ok');
                    return;
                }

                success('ok');
                d.resolve('ok');
            } catch (err) {
                console.error('Supabase Ajax Error:', err);
                if (typeof swal === 'function') {
                    swal('เกิดข้อผิดพลาดในการเชื่อมต่อ Supabase', (err && err.message) ? err.message : String(err), 'error');
                }
                success('error');
                d.resolve('error');
            }
        })();

        return d.promise();
    };

    // ========================================================================
    // INTERCEPT $.fn.load FOR ALL DYNAMIC PHP VIEWS
    // ========================================================================
    const origLoad = $.fn.load;
    $.fn.load = function (url, params, callback) {
        if (typeof url !== 'string' || url.indexOf('.php') === -1) {
            return origLoad.apply(this, arguments);
        }
        const $el = this;
        const sb = getSupabase();
        const sess = getSession();
        const ds = sess.date_sale || '20261020';

        const qIndex = url.indexOf('?');
        const baseFile = qIndex !== -1 ? url.substring(0, qIndex) : url;
        const queryStr = qIndex !== -1 ? url.substring(qIndex + 1) : '';
        const urlParams = new URLSearchParams(queryStr);

        (async function () {
            if (!sb) return;
            try {
                // 1. time.php
                if (baseFile === 'time.php') {
                    const now = new Date();
                    const hh = String(now.getHours()).padStart(2, '0');
                    const mm = String(now.getMinutes()).padStart(2, '0');
                    const ss = String(now.getSeconds()).padStart(2, '0');
                    $el.html(`<div id="server_time">${thaiDateLong(ds)}  ${hh}:${mm}:${ss}</div>`);
                    return;
                }

                // 2. newkey_num.php
                if (baseFile === 'newkey_num.php') {
                    const ctx = await fetchContextData(sb, ds);
                    window.closedNumbersList = ctx.closedNums || [];
                    window.halfNumbersList = ctx.halfNums ? Object.keys(ctx.halfNums) : [];

                    const defaultCusList = [
                        '10เปอร์เซนต์', '20เปอร์เซนต์', '30เปอร์เซนต์', 'ตู่', 'ต๋อง', 'นนท์', 'นอก',
                        'น้าจิตร', 'น้าอุ๋ย', 'น้าไหม', 'ป้านวย', 'ป้าเพลิน', 'ป้าแขก', 'ฝ้าย',
                        'พี่จิ้ม', 'พี่นก', 'พี่สมร', 'พี่อ้อม', 'พี่เกมส์', 'พี่เปย์', 'พี่แต๋ม',
                        'พี่แนน', 'ลาวพี่อ้อม', 'ลุงคิด', 'อัจจิมา', 'อั้ม', 'เดียร์', 'แคท',
                        'แม่ติ๋ว', 'ไม่หักเปอร์เซนต์'
                    ];

                    let cusList = [];
                    if (ctx.customers && ctx.customers.length > 0) {
                        cusList = ctx.customers.map(c => (typeof c === 'string' ? c : c.name));
                    } else {
                        const existingOpts = [];
                        $('#txt_note option').each(function() {
                            const v = $(this).val();
                            if (v) existingOpts.push(v);
                        });
                        cusList = existingOpts.length > 0 ? existingOpts : defaultCusList;
                    }

                    const isLocked = !!(sess.chlock && String(sess.chlock) !== '0');
                    const curSel = isLocked ? (sess.lock_cus || '') : ($('#txt_note').val() || '');

                    let opts = '<option value="">เลือก</option>';
                    cusList.forEach(cname => {
                        const sel = (cname === curSel) ? 'selected' : '';
                        opts += `<option value="${esc(cname)}" ${sel}>${esc(cname)}</option>`;
                    });

                    if ($('#txt_note').length > 0) {
                        $('#txt_note').html(opts);
                        if (curSel) {
                            $('#txt_note').val(curSel);
                            getautobill(curSel);
                        }
                    }

                    if (isLocked) {
                        $('#Checkcus').prop('checked', true).prop('disabled', false);
                        $('#txt_note').prop('disabled', true);
                    } else {
                        $('#Checkcus').prop('checked', false).prop('disabled', false);
                        $('#txt_note').prop('disabled', false);
                    }

                    $('#txtbill').prop('disabled', false);
                    $('#btnbegin').prop('disabled', false);

                    // Clean tbExp table rows (keep only header row) - no input rows until 'เริ่มขาย'
                    const tb = document.getElementById('tbExp');
                    if (tb) {
                        while (tb.rows.length > 1) {
                            tb.deleteRow(1);
                        }
                    }
                    if (document.getElementById('txt_table_length')) document.getElementById('txt_table_length').value = '0';
                    if (document.getElementById('txt_keepname_onclick')) document.getElementById('txt_keepname_onclick').value = '0';
                    if (document.getElementById('txt_keepname')) document.getElementById('txt_keepname').value = '';
                    if (document.getElementById('totalbill')) document.getElementById('totalbill').value = '0';
                    if (document.getElementById('txtinvite')) document.getElementById('txtinvite').innerHTML = '';
                    if (document.getElementById('sums')) document.getElementById('sums').innerHTML = '0';
                    if (document.getElementById('btninsert')) document.getElementById('btninsert').disabled = true;

                    if (document.getElementById('txt41')) document.getElementById('txt41').disabled = true;
                    if (document.getElementById('txt42')) document.getElementById('txt42').disabled = true;
                    if (document.getElementById('txt43')) document.getElementById('txt43').disabled = true;
                    if (document.getElementById('txt44')) document.getElementById('txt44').disabled = true;

                    return;
                }

                // 3. logbill.php
                if (baseFile === 'logbill.php') {
                    const ctx = await fetchContextData(sb, ds);
                    const { data: allBets } = await sb.from('bets').select('*').eq('date_sale', ds);
                    const hasResult = !!(ctx.resultRow && String(ctx.resultRow.hight || '').trim() !== '');

                    const cusStats = {};
                    (allBets || []).forEach(b => {
                        const cname = (b.cus || 'ไม่ระบุ').trim();
                        if (!cusStats[cname]) {
                            cusStats[cname] = { sale: 0, net: 0, win: 0, profit: 0 };
                        }
                        const c = calcBetRow(b, ctx.cusMap, ctx.resultRow, ctx.halfNums);
                        cusStats[cname].sale += c.sale;
                        cusStats[cname].net += c.net;
                        cusStats[cname].win += c.win;
                        cusStats[cname].profit += c.profit;
                    });

                    const cusNames = Object.keys(cusStats).sort((a, b) => a.localeCompare(b, 'th'));
                    let sumTotal = 0, sumNet = 0, sumWin = 0, sumProfit = 0;
                    let tbody = '';

                    cusNames.forEach(cname => {
                        const st = cusStats[cname];
                        sumTotal += st.sale;
                        sumNet += st.net;
                        sumWin += st.win;
                        sumProfit += st.profit;
                        const pColor = st.profit >= 0 ? 'green' : 'red';
                        tbody += `
                        <tr>
                            <td style="padding: 4px 2px 0px 5px;text-align: left">
                                <a href="javascript:void(0)" id="showlogbill" data-cus="${esc(cname)}" data-sumbill="${Math.round(st.sale)}"><b>${esc(cname)}</b></a>
                            </td>
                            <td style="padding: 4px 2px 0px 2px;text-align: right">${nf(st.sale)}</td>
                            <td style="padding: 4px 2px 0px 2px;text-align: right">${nf(st.net)}</td>
                            <td style="padding: 4px 2px 0px 2px;text-align: right;color:${hasResult ? (st.win > 0 ? 'red' : '#333') : 'orange'};">
                                <b>${hasResult ? nf(st.win) : 'รอผล'}</b>
                            </td>
                            <td style="padding: 4px 2px 0px 2px;text-align: right;color:${hasResult ? pColor : 'orange'};">
                                <b>${hasResult ? (st.profit >= 0 ? nf(st.profit) : nf(st.profit)) : 'รอผล'}</b>
                            </td>
                            <td style="padding: 2px 2px 2px 2px;text-align: center; white-space: nowrap;">
                                <a href="javascript:void(0)" id="showlogbill" data-cus="${esc(cname)}" data-sumbill="${Math.round(st.sale)}" class="btn btn-success btn-xs" style="padding: 1px 5px;">บิล</a>
                                <a href="pdflotto/bill_pdf.html?cus=${encodeURIComponent(cname)}" target="_blank" class="btn btn-primary btn-xs" style="padding: 1px 5px;">PDF</a>
                            </td>
                        </tr>`;
                    });

                    const profitText = sumProfit >= 0 ? `กำไร +${nf(sumProfit)} บาท` : `ขาดทุน ${nf(sumProfit)} บาท`;
                    const sumProfitColor = sumProfit >= 0 ? 'green' : 'red';
                    const html = `
                    <div class="row">
                        <div class="col-md-12" style="text-align: right">
                            <h3 style="color: #808080;">รายการบิลลูกค้าทั้งหมด</h3>
                        </div>
                    </div>
                    <div class="table-responsive">
                        <table class="table table-sm table-bordered table-responsive">
                            <thead>
                                <tr>
                                    <th>ชื่อลูกค้า</th>
                                    <th>ยอดขาย</th>
                                    <th>หลังหักส่วนลด</th>
                                    <th>ถูกรางวัล</th>
                                    <th>ผล +/-</th>
                                    <th style="text-align: center">#</th>
                                </tr>
                            </thead>
                            <tbody>${tbody}</tbody>
                            <tfoot>
                                <tr style="background-color: #f7ecb5">
                                    <td style="padding: 4px 2px 0px 2px;text-align: center"><b>รวม</b></td>
                                    <td style="padding: 4px 2px 0px 2px;text-align: right"><b>${nf(sumTotal)}</b></td>
                                    <td style="padding: 4px 2px 0px 2px;text-align: right"><b>${nf(sumNet)}</b></td>
                                    <td style="padding: 4px 2px 0px 2px;text-align: right;color:${hasResult && sumWin > 0 ? 'red' : '#000'};"><b>${hasResult ? nf(sumWin) : '0'}</b></td>
                                    <td style="padding: 4px 2px 0px 2px;text-align: right;color:${hasResult ? sumProfitColor : '#000'};"><b>${hasResult ? nf(sumProfit) : '0'}</b></td>
                                    <td style="padding: 0px 0px 0px 0px;text-align: center">
                                        <a class="btn btn-danger btn-sm" style="width: 100%" href="pdflotto/summary.html" target="_blank">PDF สรุป</a>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    <div class="table-responsive">
                        <table class="table table-sm table-bordered table-responsive">
                            <thead>
                                <tr><th colspan="5" style="text-align: center">ตารางสรุปผล กำไรขาดทุน</th></tr>
                                <tr>
                                    <th style="text-align:center">รายการ</th>
                                    <th style="text-align:center">ยอดขาย</th>
                                    <th style="text-align:center">หลังหักส่วนลด</th>
                                    <th style="text-align:center">ถูกรางวัล</th>
                                    <th style="text-align:center">ผล +/-</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style="padding: 4px 2px 0px 2px;text-align: right"><b>รวมยอดทั้งหมด</b></td>
                                    <td style="padding: 4px 2px 0px 2px;text-align: right"><b>${nf(sumTotal)}</b></td>
                                    <td style="padding: 4px 2px 0px 2px;text-align: right;color:${hasResult ? 'blue' : 'orange'};"><b>${hasResult ? nf(sumNet) : 'รอผล'}</b></td>
                                    <td style="padding: 4px 2px 0px 2px;text-align: right;color:${hasResult ? 'red' : 'orange'};"><b>${hasResult ? nf(sumWin) : 'รอผล'}</b></td>
                                    <td style="padding: 4px 2px 0px 2px;text-align: right;color:${hasResult ? sumProfitColor : 'orange'};"><b>${hasResult ? nf(sumProfit) : 'รอผล'}</b></td>
                                </tr>
                                <tr>
                                    <td style="padding: 4px 2px 0px 2px;text-align: right"><b>รายการส่งออก</b></td>
                                    <td style="padding: 4px 2px 0px 2px;text-align: right"><b>0</b></td>
                                    <td style="padding: 4px 2px 0px 2px;text-align: right;color:${hasResult ? 'blue' : 'orange'};"><b>${hasResult ? '0' : 'รอผล'}</b></td>
                                    <td style="padding: 4px 2px 0px 2px;text-align: right;color:${hasResult ? 'red' : 'orange'};"><b>${hasResult ? '0' : 'รอผล'}</b></td>
                                    <td style="padding: 4px 2px 0px 2px;text-align: right;color:${hasResult ? 'green' : 'orange'};"><b>${hasResult ? '0' : 'รอผล'}</b></td>
                                </tr>
                                <tr>
                                    <td style="padding: 4px 2px 0px 2px;text-align: right;"><b>สรุปผลกำไรขาดทุน</b></td>
                                    <td colspan="4" style="padding: 4px 2px 0px 2px;text-align: center;color:${hasResult ? sumProfitColor : 'orange'};font-size:16px;">
                                        <b>${hasResult ? profitText : 'รอผล'}</b>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>`;
                    $el.html(html);
                    return;
                }

                // 4. logbillagent.php
                if (baseFile === 'logbillagent.php') {
                    const cus = (urlParams.get('cus') || '').trim();
                    const ctx = await fetchContextData(sb, ds);
                    const { data: bets } = await sb.from('bets').select('*').eq('date_sale', ds).eq('cus', cus).order('id', { ascending: true });
                    const hasResult = !!(ctx.resultRow && String(ctx.resultRow.hight || '').trim() !== '');

                    const billGroups = {};
                    (bets || []).forEach(b => {
                        let bno = String(b.bill || '').trim();
                        if (!bno) bno = '001';
                        if (!billGroups[bno]) billGroups[bno] = { sale: 0, net: 0, win: 0, profit: 0 };
                        const c = calcBetRow(b, ctx.cusMap, ctx.resultRow, ctx.halfNums);
                        billGroups[bno].sale += c.sale;
                        billGroups[bno].net += c.net;
                        billGroups[bno].win += c.win;
                        billGroups[bno].profit += c.profit;
                    });

                    const billKeys = Object.keys(billGroups).sort((a, b) => (parseInt(a, 10) || 0) - (parseInt(b, 10) || 0));
                    let sumSale = 0, sumNet = 0, sumWin = 0, sumProfit = 0;
                    let tbody = '';

                    billKeys.forEach(bno => {
                        const st = billGroups[bno];
                        sumSale += st.sale;
                        sumNet += st.net;
                        sumWin += st.win;
                        sumProfit += st.profit;
                        const pColor = st.profit >= 0 ? 'green' : 'red';
                        tbody += `
                        <tr>
                            <td style="text-align: center; padding: 4px 2px;">
                                <a href="javascript:void(0)" class="btn-subbill-detail" data-cus="${esc(cus)}" data-bill="${esc(bno)}" data-total="${Math.round(st.sale)}"><b>บิลย่อยที่ ${esc(bno)}</b></a>
                            </td>
                            <td style="text-align: right; padding: 4px 5px;">${nf(st.sale)}</td>
                            <td style="text-align: right; padding: 4px 5px;">${nf(st.net)}</td>
                            <td style="text-align: right; padding: 4px 5px; color:${hasResult ? (st.win > 0 ? 'red' : '#333') : 'orange'};"><b>${hasResult ? nf(st.win) : 'รอผล'}</b></td>
                            <td style="text-align: right; padding: 4px 5px; color:${hasResult ? pColor : 'orange'};"><b>${hasResult ? nf(st.profit) : 'รอผล'}</b></td>
                            <td style="text-align: center; padding: 2px;">
                                <a href="javascript:void(0)" class="btn btn-info btn-xs btn-subbill-detail" data-cus="${esc(cus)}" data-bill="${esc(bno)}" data-total="${Math.round(st.sale)}">ดู/แก้ไข</a>
                                <a href="pdflotto/bill_sub_pdf.html?cus=${encodeURIComponent(cus)}&bill=${encodeURIComponent(bno)}" target="_blank" class="btn btn-warning btn-xs">พิมพ์</a>
                                <a href="javascript:void(0)" class="btn btn-danger btn-xs btn-subbill-del" data-cus="${esc(cus)}" data-bill="${esc(bno)}">ลบบิล</a>
                            </td>
                        </tr>`;
                    });

                    const html = `
                    <div class="row" style="margin-bottom: 10px;">
                        <div class="col-md-8">
                            <h4 style="color:#007fff; margin:0;">สาย: <b>${esc(cus)}</b> (ทั้งหมด ${billKeys.length} บิลย่อย)</h4>
                        </div>
                        <div class="col-md-4" style="text-align:right;">
                            <h4 style="color:#c12e2a; margin:0;">รวมยอดขาย: <b>${nf(sumSale)}</b> บาท</h4>
                        </div>
                    </div>
                    <div class="table-responsive">
                        <table class="table table-sm table-bordered table-hover">
                            <thead>
                                <tr style="background-color:#f5f5f5;">
                                    <th style="text-align:center;">ใบเสร็จ / บิลย่อย</th>
                                    <th style="text-align:right;">ยอดขาย</th>
                                    <th style="text-align:right;">หลังหักส่วนลด</th>
                                    <th style="text-align:right;">ถูกรางวัล</th>
                                    <th style="text-align:right;">ผล +/-</th>
                                    <th style="text-align:center;">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>${tbody}</tbody>
                            <tfoot>
                                <tr style="background-color:#f7ecb5; font-weight:bold;">
                                    <td style="text-align:center;">รวมทั้งหมด</td>
                                    <td style="text-align:right;">${nf(sumSale)}</td>
                                    <td style="text-align:right;">${nf(sumNet)}</td>
                                    <td style="text-align:right;color:${hasResult && sumWin > 0 ? 'red' : '#000'};">${hasResult ? nf(sumWin) : '0'}</td>
                                    <td style="text-align:right;color:${hasResult ? (sumProfit >= 0 ? 'green' : 'red') : '#000'};">${hasResult ? nf(sumProfit) : '0'}</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    <script>
                        window.m1close = function() { $('#modallog1').modal('hide'); };
                        $('.btn-subbill-detail').off('click').on('click', function() {
                            var c = $(this).attr('data-cus');
                            var b = $(this).attr('data-bill');
                            var t = $(this).attr('data-total');
                            $('#mobilllog').load('billdetail_agent_list.php?cus=' + encodeURIComponent(c) + '&bill=' + encodeURIComponent(b) + '&total=' + t);
                            $('#modallog1').modal('show');
                        });
                        $('.btn-subbill-del').off('click').on('click', function() {
                            var c = $(this).attr('data-cus');
                            var b = $(this).attr('data-bill');
                            swal({
                                title: 'ยืนยันการลบบิลย่อยที่ ' + b + ' ?',
                                text: 'ของลูกค้า: ' + c,
                                type: 'warning',
                                showCancelButton: true,
                                confirmButtonText: 'ใช่, ลบบิลนี้',
                                cancelButtonText: 'ยกเลิก'
                            }).then(function(res) {
                                if (res.value) {
                                    $.ajax({
                                        method: 'POST',
                                        url: 'lotto.php',
                                        data: { delbillagent: 'ok', acus: c, abill: b },
                                        success: function() {
                                            $('#mlogbill').load('logbillagent.php?cus=' + encodeURIComponent(c));
                                            tab1_ref();
                                        }
                                    });
                                }
                            });
                        });
                    <\/script>`;
                    $el.html(html);
                    return;
                }

                // 5. billdetail_agent_list.php
                if (baseFile === 'billdetail_agent_list.php') {
                    const acus = (urlParams.get('acus') || urlParams.get('cus') || '').trim();
                    const abill = (urlParams.get('abill') || urlParams.get('bill') || '001').trim();
                    const ctx = await fetchContextData(sb, ds);
                    const { data: allBets } = await sb.from('bets').select('*').eq('date_sale', ds).eq('cus', acus).order('id', { ascending: true });
                    const rows = (allBets || []).filter(r => {
                        const rb = String(r.bill || '001').trim();
                        return rb === abill || parseInt(rb, 10) === parseInt(abill, 10);
                    });

                    let sum_bill = 0;
                    let sum_win_bill = 0;
                    let tbody = '';

                    if (rows.length === 0) {
                        tbody = `<tr><td colspan="7" style="text-align:center;color:#999;padding:15px;">ไม่พบรายการในบิลนี้</td></tr>`;
                    } else {
                        rows.forEach((r) => {
                            const id = r.id;
                            const type_num = String(r.num || '').trim().length;
                            const c = calcBetRow(r, ctx.cusMap, ctx.resultRow, ctx.halfNums);
                            const is_row_win = (c.win > 0);
                            const wt = c.hit_types || [];
                            const win_col1 = wt.some(h => h.includes('บน') || h.includes('ตรง'));
                            const win_col2 = wt.some(h => h.includes('ล่าง') && !h.includes('3ตัว') || h.includes('โต๊ต'));
                            const win_col3 = wt.some(h => h.includes('3ตัวล่าง'));

                            const row_style = is_row_win ? 'background-color:#fff8dc;' : '';
                            const num_style = is_row_win ? 'color:#d9534f;font-weight:bold;font-size:17px;' : '';
                            const style_col1 = win_col1 ? 'text-align:center;background-color:#dff0d8;color:#d9534f;font-weight:bold;border:2px solid #5cb85c;' : 'text-align:center;';
                            const style_col2 = win_col2 ? 'text-align:center;background-color:#dff0d8;color:#d9534f;font-weight:bold;border:2px solid #5cb85c;' : 'text-align:center;';
                            const style_col3 = win_col3 ? 'text-align:center;background-color:#dff0d8;color:#d9534f;font-weight:bold;border:2px solid #5cb85c;' : 'text-align:center;';

                            sum_bill += (parseFloat(r.bet1 || 0) + parseFloat(r.bet2 || 0) + parseFloat(r.bet3 || 0));
                            sum_win_bill += (c.win || 0);

                            tbody += `
                            <tr style="text-align:center;${row_style}">
                                <td style="vertical-align:middle;${num_style}">
                                    ${esc(r.num)}
                                    ${is_row_win ? `<br><span class="label label-danger" style="font-size:10px;">ถูก ${nf(c.win)}</span>` : ''}
                                </td>
                                <td>
                                    <input type="text" class="form-control" style="${style_col1}" id="editten${id}" value="${parseInt(r.bet1, 10) || 0}" disabled>
                                </td>
                                <td>
                                    <input type="text" class="form-control" style="${style_col2}" id="edittos${id}" value="${parseInt(r.bet2, 10) || 0}" disabled>
                                </td>
                                <td>
                                    <input type="text" class="form-control" style="${style_col3}" id="edittlo${id}" value="${parseInt(r.bet3, 10) || 0}" disabled>
                                </td>
                                <td style="vertical-align:middle;font-size:13px;">${esc(r.timenow || '')}</td>
                                <td style="vertical-align:middle;">${esc(sess.username || 'user1')}</td>
                                <td style="vertical-align:middle;">
                                    <button type="button" class="btn btn-warning btn-sm" id="btneditbill${id}" onclick="editbill(${id}, ${type_num})">
                                        <span id="edittext${id}">แก้ไข</span>
                                    </button>
                                    <button type="button" class="btn btn-danger btn-sm" onclick="delNumberItem(this)"
                                        data-id="${id}" 
                                        data-cus="${esc(acus)}" 
                                        data-bill="${esc(abill)}" 
                                        data-numbe="${esc(r.num)}">ลบ</button>
                                </td>
                            </tr>`;
                        });
                    }

                    const html = `
                    <div class="panel panel-info">
                        <div class="panel-heading">รายการบิลย่อย ${esc(abill)}</div>
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th style="text-align: center;">หมายเลข</th>
                                        <th style="text-align: center;">บน/เต็ง</th>
                                        <th style="text-align: center;">ล่าง/โต๊ต</th>
                                        <th style="text-align: center;">3ตัวล่าง</th>
                                        <th style="text-align: center;" width="140">วันที่บันทึก</th>
                                        <th style="text-align: center;">USER</th>
                                        <th style="text-align: center;" width="130">จัดการ แก้ไข</th>
                                    </tr>
                                </thead>
                                <tbody>${tbody}</tbody>
                            </table>
                            <hr style="margin-top:5px;margin-bottom:10px;">
                            <div style="text-align:center;margin-bottom:15px;">
                                <h3>ยอดรวมบิลนี้ <span style="color:red">${nf(sum_bill)}</span> บาท</h3>
                                ${sum_win_bill > 0 ? `<h4 style="color:#5cb85c;font-weight:bold;">ยอดถูกรางวัลบิลนี้: <span style="color:#d9534f;">${nf(sum_win_bill)}</span> บาท</h4>` : ''}
                            </div>
                        </div>
                    </div>
                    <script>
                        window.m1close = function() { $('#modallog1').modal('hide'); };
                        window.current_acus = ${JSON.stringify(acus)};
                        window.current_abill = ${JSON.stringify(abill)};

                        window.editbill = function(id, type_number) {
                            var asd = document.getElementById('btneditbill' + id);

                            if (document.getElementById('editten' + id).disabled == true) {
                                document.getElementById('editten' + id).disabled = false;
                                document.getElementById('edittos' + id).disabled = false;
                                if (type_number == 3) {
                                    document.getElementById('edittlo' + id).disabled = false;
                                }
                                document.getElementById('edittext' + id).innerHTML = "บันทึก";
                                asd.setAttribute('class', 'btn btn-success btn-sm');
                                document.getElementById('editten' + id).focus();
                                document.getElementById('editten' + id).select();
                            } else {
                                if (document.getElementById('editten' + id).value == '') document.getElementById('editten' + id).value = 0;
                                if (document.getElementById('edittlo' + id).value == '') document.getElementById('edittlo' + id).value = 0;
                                if (document.getElementById('edittos' + id).value == '') document.getElementById('edittos' + id).value = 0;

                                var tenk = document.getElementById('editten' + id).value;
                                var tlow = document.getElementById('edittlo' + id).value;
                                var tose = document.getElementById('edittos' + id).value;

                                document.getElementById('editten' + id).disabled = true;
                                document.getElementById('edittlo' + id).disabled = true;
                                document.getElementById('edittos' + id).disabled = true;
                                document.getElementById('edittext' + id).innerHTML = "แก้ไข";
                                asd.setAttribute('class', 'btn btn-warning btn-sm');

                                $.ajax({
                                    method: "POST",
                                    url: "lotto.php",
                                    data: {
                                        editbill: id,
                                        tenk: tenk,
                                        tose: tose,
                                        tlow: tlow
                                    },
                                    success: function(val) {
                                        if ($('#mobilllog').length && window.current_acus) {
                                            $('#mobilllog').load('billdetail_agent_list.php?acus=' + encodeURIComponent(window.current_acus) + '&abill=' + encodeURIComponent(window.current_abill));
                                            $('#mlogbill').load('logbillagent.php?cus=' + encodeURIComponent(window.current_acus));
                                        }
                                        if ($('#showbillsale').length && window.current_sale_codeid) {
                                            $('#showbillsale').load('showbillsale.php?codeid=' + encodeURIComponent(window.current_sale_codeid) + '&countrowinsert=' + encodeURIComponent(window.current_countrowinsert || ''));
                                        }
                                        $('#showbill').load('logbill.php');
                                        if (typeof total1 === 'function') total1();
                                        if (typeof total2 === 'function') total2();
                                        if (typeof total3 === 'function') total3();
                                        if (typeof totalsale === 'function') totalsale();
                                    }
                                });
                            }
                        };

                        window.delNumberItem = function(btn) {
                            var id = $(btn).attr('data-id');
                            var datacus = $(btn).attr('data-cus');
                            var databill = $(btn).attr('data-bill');
                            var numbe = $(btn).attr('data-numbe');

                            swal({
                                title: 'ลบ ' + numbe,
                                type: 'question',
                                showCancelButton: true,
                                allowOutsideClick: false,
                                confirmButtonColor: '#3085d6',
                                cancelButtonColor: '#d33',
                                confirmButtonText: 'ใช่',
                                cancelButtonText: 'ไม่'
                            }).then(function(result) {
                                if (result && (result.value || result === true)) {
                                    $.ajax({
                                        method: "POST",
                                        url: "lotto.php",
                                        data: {
                                            delnumberbill: id
                                        },
                                        success: function(val) {
                                            if ($.trim(val) == 'ok') {
                                                $('#mobilllog').load('billdetail_agent_list.php?acus=' + encodeURIComponent(datacus) + '&abill=' + encodeURIComponent(databill));
                                                $('#mlogbill').load('logbillagent.php?cus=' + encodeURIComponent(datacus));
                                                $('#showbill').load('logbill.php');
                                                if (typeof total1 === 'function') total1();
                                                if (typeof total2 === 'function') total2();
                                                if (typeof total3 === 'function') total3();
                                                if (typeof totalsale === 'function') totalsale();
                                            }
                                        }
                                    });
                                }
                            });
                        };
                    <\/script>`;
                    $el.html(html);
                    return;
                }

                // 5.5 showbillsale.php (รายงานผล หมายเลขที่บันทึกได้)
                if (baseFile === 'showbillsale.php') {
                    const codeid = urlParams.get('codeid') || '';
                    const countrowinsert = parseInt(urlParams.get('countrowinsert') || '0', 10);
                    window.current_sale_codeid = codeid;
                    window.current_countrowinsert = countrowinsert;

                    let bRows = [];
                    if (codeid) {
                        const { data } = await sb.from('bets').select('*').eq('codeid', codeid).order('id', { ascending: true });
                        bRows = data || [];
                    }
                    if (bRows.length === 0 && countrowinsert > 0) {
                        const { data } = await sb.from('bets').select('*').eq('date_sale', ds).order('id', { ascending: false }).limit(countrowinsert);
                        if (data) bRows = data.reverse();
                    }

                    let tbody = '';
                    let totalBuy = 0;
                    (bRows || []).forEach(r => {
                        const b1 = parseFloat(r.bet1 || 0);
                        const b2 = parseFloat(r.bet2 || 0);
                        const b3 = parseFloat(r.bet3 || 0);
                        totalBuy += (b1 + b2 + b3);

                        const id = r.id;
                        const type_num = parseInt(r.num_type || String(r.num || '').length, 10);
                        const ds_str = String(r.date_sale || '');
                        const d_display = ds_str.length === 8 ? (ds_str.substring(6, 8) + '-' + ds_str.substring(4, 6) + '-' + ds_str.substring(0, 4)) : '';
                        const dt_display = d_display ? (d_display + ' ' + (r.timenow || '')) : (r.timenow || '');

                        tbody += `
                        <tr style="text-align: center;">
                            <td style="vertical-align: middle; font-weight: bold; font-size: 15px;">
                                ${esc(r.num)}
                            </td>
                            <td style="vertical-align: middle;">
                                <input type="text" class="form-control" style="text-align: center; font-weight: 500;" id="editten${id}" value="${b1}" disabled>
                            </td>
                            <td style="vertical-align: middle;">
                                <input type="text" class="form-control" style="text-align: center; font-weight: 500;" id="edittos${id}" value="${b2}" disabled>
                            </td>
                            <td style="vertical-align: middle;">
                                <input type="text" class="form-control" style="text-align: center; font-weight: 500;" id="edittlo${id}" value="${b3}" disabled>
                            </td>
                            <td style="vertical-align: middle; font-size: 13px;">
                                ${esc(dt_display)}
                            </td>
                            <td style="vertical-align: middle;">
                                <button type="button" class="btn btn-warning btn-sm" id="btneditbill${id}" onclick="editbill(${id}, ${type_num})">
                                    <span id="edittext${id}">แก้ไข</span>
                                </button>
                            </td>
                        </tr>`;
                    });

                    if (bRows.length === 0) {
                        tbody = `<tr><td colspan="6" style="text-align: center; color: #999; padding: 20px;">ไม่พบรายการบันทึก</td></tr>`;
                    }

                    const attempts = countrowinsert > 0 ? countrowinsert : bRows.length;
                    const successCount = bRows.length;

                    const html = `
                    <div class="table-responsive">
                        <table class="table table-hover table-bordered" style="margin-bottom: 0;">
                            <thead>
                                <tr style="background: #fff;">
                                    <th style="text-align: center; vertical-align: middle;">หมายเลข</th>
                                    <th style="text-align: center; vertical-align: middle;">บน/เต็ง</th>
                                    <th style="text-align: center; vertical-align: middle;">ล่าง/โต๊ด</th>
                                    <th style="text-align: center; vertical-align: middle;">3ตัวล่าง</th>
                                    <th style="text-align: center; vertical-align: middle;">วันที่บันทึก</th>
                                    <th style="text-align: center; vertical-align: middle;">จัดการ แก้ไข</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${tbody}
                            </tbody>
                        </table>
                    </div>

                    <div style="text-align: center; padding: 15px 0 5px 0;">
                        <h3 style="font-weight: bold; margin: 10px 0 5px 0; font-size: 22px;">
                            ยอดรวมบิลนี้ที่ซื้อได้ <span style="color: red; font-size: 26px;">${nf(totalBuy)}</span> บาท
                        </h3>
                        <p style="font-size: 14px; color: #555; margin: 0;">
                            รายการทั้งหมด ${attempts} รายการ บันทึกสำเร็จ ${successCount} รายการ
                        </p>
                    </div>
                    <script>
                        window.current_sale_codeid = ${JSON.stringify(codeid)};
                        window.current_countrowinsert = ${JSON.stringify(countrowinsert)};

                        window.editbill = function(id, type_number) {
                            var asd = document.getElementById('btneditbill' + id);
                            if (!asd) return;

                            if (document.getElementById('editten' + id).disabled == true) {
                                document.getElementById('editten' + id).disabled = false;
                                document.getElementById('edittos' + id).disabled = false;
                                if (type_number == 3) {
                                    document.getElementById('edittlo' + id).disabled = false;
                                }
                                document.getElementById('edittext' + id).innerHTML = "บันทึก";
                                asd.setAttribute('class', 'btn btn-success btn-sm');
                                document.getElementById('editten' + id).focus();
                                document.getElementById('editten' + id).select();
                            } else {
                                if (document.getElementById('editten' + id).value == '') document.getElementById('editten' + id).value = 0;
                                if (document.getElementById('edittlo' + id).value == '') document.getElementById('edittlo' + id).value = 0;
                                if (document.getElementById('edittos' + id).value == '') document.getElementById('edittos' + id).value = 0;

                                var tenk = document.getElementById('editten' + id).value;
                                var tlow = document.getElementById('edittlo' + id).value;
                                var tose = document.getElementById('edittos' + id).value;

                                document.getElementById('editten' + id).disabled = true;
                                document.getElementById('edittlo' + id).disabled = true;
                                document.getElementById('edittos' + id).disabled = true;
                                document.getElementById('edittext' + id).innerHTML = "แก้ไข";
                                asd.setAttribute('class', 'btn btn-warning btn-sm');

                                $.ajax({
                                    method: "POST",
                                    url: "lotto.php",
                                    data: {
                                        editbill: id,
                                        tenk: tenk,
                                        tose: tose,
                                        tlow: tlow
                                    },
                                    success: function(val) {
                                        if ($('#showbillsale').length && window.current_sale_codeid) {
                                            $('#showbillsale').load('showbillsale.php?codeid=' + encodeURIComponent(window.current_sale_codeid) + '&countrowinsert=' + encodeURIComponent(window.current_countrowinsert || ''));
                                        }
                                        if ($('#mobilllog').length && window.current_acus) {
                                            $('#mobilllog').load('billdetail_agent_list.php?acus=' + encodeURIComponent(window.current_acus) + '&abill=' + encodeURIComponent(window.current_abill));
                                            $('#mlogbill').load('logbillagent.php?cus=' + encodeURIComponent(window.current_acus));
                                        }
                                        $('#showbill').load('logbill.php');
                                        if (typeof total1 === 'function') total1();
                                        if (typeof total2 === 'function') total2();
                                        if (typeof total3 === 'function') total3();
                                        if (typeof totalsale === 'function') totalsale();
                                    }
                                });
                            }
                        };
                    <\/script>`;
                    $el.html(html);
                    return;
                }

                // 6. detail.php (ข้อมูลเลขที่ขาย)
                if (baseFile === 'detail.php') {
                    const ctx = await fetchContextData(sb, ds);
                    const { data: allBets } = await sb.from('bets').select('*').eq('date_sale', ds);

                    const g2 = {}, g3 = {}, g1 = {};
                    let sum2 = 0, sum3 = 0, sum1 = 0;

                    (allBets || []).forEach(b => {
                        const n = String(b.num || '').trim();
                        const b1 = parseFloat(b.bet1 || 0);
                        const b2 = parseFloat(b.bet2 || 0);
                        const b3 = parseFloat(b.bet3 || 0);
                        if (n.length === 2) {
                            if (!g2[n]) g2[n] = { b1: 0, b2: 0 };
                            g2[n].b1 += b1; g2[n].b2 += b2;
                            sum2 += b1 + b2;
                        } else if (n.length === 3) {
                            if (!g3[n]) g3[n] = { b1: 0, b2: 0, b3: 0 };
                            g3[n].b1 += b1; g3[n].b2 += b2; g3[n].b3 += b3;
                            sum3 += b1 + b2 + b3;
                        } else if (n.length === 1) {
                            if (!g1[n]) g1[n] = { b1: 0, b2: 0 };
                            g1[n].b1 += b1; g1[n].b2 += b2;
                            sum1 += b1 + b2;
                        }
                    });

                    const rHight = ctx.resultRow ? String(ctx.resultRow.hight || '').trim() : '';
                    const rTwolow = ctx.resultRow ? String(ctx.resultRow.Twolow || '').trim() : '';
                    const r2Up = rHight.length === 3 ? rHight.substring(1, 3) : '';
                    const rTlows = ctx.resultRow ? [ctx.resultRow.Tlow1, ctx.resultRow.Tlow2, ctx.resultRow.Tlow3, ctx.resultRow.Tlow4] : [];

                    let rows2 = '';
                    Object.keys(g2).sort().forEach(n => {
                        const it = g2[n];
                        const winUp = (r2Up !== '' && n === r2Up && it.b1 > 0);
                        const winDown = (rTwolow !== '' && n === rTwolow && it.b2 > 0);
                        const trStyle = (winUp || winDown) ? 'background-color:#dff0d8;font-weight:bold;' : '';
                        rows2 += `<tr style="${trStyle}">
                            <td style="text-align:center;${winUp || winDown ? 'color:red;font-weight:bold;' : ''}">${esc(n)}</td>
                            <td style="text-align:right;${winUp ? 'color:red;font-weight:bold;' : ''}">${nf(it.b1)}</td>
                            <td style="text-align:right;${winDown ? 'color:red;font-weight:bold;' : ''}">${nf(it.b2)}</td>
                        </tr>`;
                    });

                    let rows3 = '';
                    Object.keys(g3).sort().forEach(n => {
                        const it = g3[n];
                        const winDirect = (rHight !== '' && n === rHight && it.b1 > 0);
                        const winTote = (rHight !== '' && isToteMatch(n, rHight) && it.b2 > 0);
                        const win3Low = (rTlows.includes(n) && it.b3 > 0);
                        const anyWin = winDirect || winTote || win3Low;
                        rows3 += `<tr style="${anyWin ? 'background-color:#dff0d8;font-weight:bold;' : ''}">
                            <td style="text-align:center;${anyWin ? 'color:red;font-weight:bold;' : ''}">
                                <a href="javascript:void(0)" onclick="showDoor6('${esc(n)}')" style="color:inherit;">${esc(n)}</a>
                            </td>
                            <td style="text-align:right;${winDirect ? 'color:red;font-weight:bold;' : ''}">${nf(it.b1)}</td>
                            <td style="text-align:right;${winTote ? 'color:red;font-weight:bold;' : ''}">${nf(it.b2)}</td>
                            <td style="text-align:right;${win3Low ? 'color:red;font-weight:bold;' : ''}">${nf(it.b3)}</td>
                        </tr>`;
                    });

                    let rows1 = '';
                    Object.keys(g1).sort().forEach(n => {
                        const it = g1[n];
                        const winRunUp = (rHight !== '' && rHight.indexOf(n) !== -1 && it.b1 > 0);
                        const winRunDown = (rTwolow !== '' && rTwolow.indexOf(n) !== -1 && it.b2 > 0);
                        const anyWin = winRunUp || winRunDown;
                        rows1 += `<tr style="${anyWin ? 'background-color:#dff0d8;font-weight:bold;' : ''}">
                            <td style="text-align:center;${anyWin ? 'color:red;font-weight:bold;' : ''}">${esc(n)}</td>
                            <td style="text-align:right;${winRunUp ? 'color:red;font-weight:bold;' : ''}">${nf(it.b1)}</td>
                            <td style="text-align:right;${winRunDown ? 'color:red;font-weight:bold;' : ''}">${nf(it.b2)}</td>
                        </tr>`;
                    });

                    const html = `
                    <div class="col-md-4">
                        <div class="panel panel-success">
                            <div class="panel-heading" id="total2">2 ตัว ยอดขาย : ${nf(sum2)}</div>
                            <div class="panel-body">
                                <table class="table table-bordered table-hover dt-detail">
                                    <thead><tr><th style="text-align:center;">เลข</th><th style="text-align:right;">บน</th><th style="text-align:right;">ล่าง</th></tr></thead>
                                    <tbody>${rows2}</tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="panel panel-danger">
                            <div class="panel-heading" id="total3">3 ตัว ยอดขาย : ${nf(sum3)}</div>
                            <div class="panel-body">
                                <table class="table table-bordered table-hover dt-detail">
                                    <thead><tr><th style="text-align:center;">เลข</th><th style="text-align:right;">เต็ง</th><th style="text-align:right;">โต๊ด</th><th style="text-align:right;">ล่าง</th></tr></thead>
                                    <tbody>${rows3}</tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="panel panel-warning">
                            <div class="panel-heading" id="total1">เลขวิ่ง ยอดขาย : ${nf(sum1)}</div>
                            <div class="panel-body">
                                <table class="table table-bordered table-hover dt-detail">
                                    <thead><tr><th style="text-align:center;">เลข</th><th style="text-align:right;">บน</th><th style="text-align:right;">ล่าง</th></tr></thead>
                                    <tbody>${rows1}</tbody>
                                </table>
                            </div>
                        </div>
                    </div>`;
                    $el.html(html);
                    if ($.fn.DataTable) {
                        $el.find('.dt-detail').each(function() {
                            var numCols = $(this).find('thead th').length;
                            var columnDefs = [];
                            for (var c = 1; c < numCols; c++) {
                                columnDefs.push({ targets: c, searchable: false });
                            }
                            $(this).DataTable({
                                pageLength: 25,
                                columnDefs: columnDefs
                            });
                        });
                    }
                    return;
                }

                // 7. detail_1.php (รายละเอียดบิล)
                if (baseFile === 'detail_1.php') {
                    const { data: allBets } = await sb.from('bets').select('*').eq('date_sale', ds).order('id', { ascending: false });
                    let rows12 = '', rows3 = '';
                    (allBets || []).forEach(r => {
                        const n = String(r.num || '').trim();
                        const bno = String(r.bill || '001').trim();
                        if (n.length === 1 || n.length === 2) {
                            rows12 += `<tr>
                                <td style="text-align:center;"><b>${esc(n)}</b></td>
                                <td style="text-align:right;">${nf(r.bet1)}</td>
                                <td style="text-align:right;">${nf(r.bet2)}</td>
                                <td style="text-align:center;">${esc(r.cus)}</td>
                                <td style="text-align:center;">${esc(bno)}</td>
                                <td style="text-align:center;">${esc(r.timenow || '')}</td>
                            </tr>`;
                        } else if (n.length === 3) {
                            rows3 += `<tr>
                                <td style="text-align:center;"><b>${esc(n)}</b></td>
                                <td style="text-align:right;">${nf(r.bet1)}</td>
                                <td style="text-align:right;">${nf(r.bet2)}</td>
                                <td style="text-align:right;">${nf(r.bet3)}</td>
                                <td style="text-align:center;">${esc(r.cus)}</td>
                                <td style="text-align:center;">${esc(bno)}</td>
                                <td style="text-align:center;">${esc(r.timenow || '')}</td>
                            </tr>`;
                        }
                    });

                    const html = `
                    <div class="col-md-6">
                        <div class="panel panel-primary">
                            <div class="panel-heading">รายละเอียดแยกบิล เลข 1 ตัว และเลข 2 ตัว</div>
                            <div class="panel-body">
                                <div class="table-responsive">
                                    <table class="table table-bordered table-hover dt-detail1">
                                        <thead>
                                            <tr>
                                                <th style="text-align:center;">หมายเลข</th>
                                                <th style="text-align:right;">บน</th>
                                                <th style="text-align:right;">ล่าง</th>
                                                <th style="text-align:center;">สาย</th>
                                                <th style="text-align:center;">บิลย่อย</th>
                                                <th style="text-align:center;">เวลา</th>
                                            </tr>
                                        </thead>
                                        <tbody>${rows12}</tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="panel panel-primary">
                            <div class="panel-heading">รายละเอียดแยกบิล เลข 3 ตัว</div>
                            <div class="panel-body">
                                <div class="table-responsive">
                                    <table class="table table-bordered table-hover dt-detail1">
                                        <thead>
                                            <tr>
                                                <th style="text-align:center;">หมายเลข</th>
                                                <th style="text-align:right;">เต็ง</th>
                                                <th style="text-align:right;">โต๊ด</th>
                                                <th style="text-align:right;">3ตัวล่าง</th>
                                                <th style="text-align:center;">สาย</th>
                                                <th style="text-align:center;">บิลย่อย</th>
                                                <th style="text-align:center;">เวลา</th>
                                            </tr>
                                        </thead>
                                        <tbody>${rows3}</tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>`;
                    $el.html(html);
                    if ($.fn.DataTable) {
                        $el.find('.dt-detail1').each(function() {
                            var is3 = $(this).find('thead th').length === 7;
                            var nonSearchable = is3 ? [1, 2, 3] : [1, 2];
                            $(this).DataTable({
                                pageLength: 25,
                                order: [],
                                columnDefs: [
                                    { targets: nonSearchable, searchable: false }
                                ]
                            });
                        });
                    }
                    return;
                }

                // 8. limitlist.php
                if (baseFile === 'limitlist.php') {
                    const { data: lrows } = await sb.from('limits').select('*').order('type', { ascending: true });
                    const map = { 1: { h: 0, t: 0, l: 0 }, 2: { h: 0, t: 0, l: 0 }, 3: { h: 0, t: 0, l: 0 } };
                    (lrows || []).forEach(r => {
                        map[r.type] = {
                            h: parseFloat(r.H !== undefined ? r.H : r.h) || 0,
                            t: parseFloat(r.T !== undefined ? r.T : r.t) || 0,
                            l: parseFloat(r.L !== undefined ? r.L : r.l) || 0
                        };
                    });
                    const html = `
                    <div class="panel panel-info">
                        <div class="panel-heading">วงเงินที่กำหนดไว้ปัจจุบัน</div>
                        <div class="table-responsive">
                            <table class="table table-bordered">
                                <thead>
                                    <tr>
                                        <th style="text-align:center;">ประเภท</th>
                                        <th style="text-align:right;">บน / เต็ง</th>
                                        <th style="text-align:right;">โต๊ด</th>
                                        <th style="text-align:right;">ล่าง</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td style="text-align:center;"><b>เลข 2 ตัว</b></td>
                                        <td style="text-align:right;">${nf(map[2].h)}</td>
                                        <td style="text-align:center;">-</td>
                                        <td style="text-align:right;">${nf(map[2].l)}</td>
                                    </tr>
                                    <tr>
                                        <td style="text-align:center;"><b>เลข 3 ตัว</b></td>
                                        <td style="text-align:right;">${nf(map[3].h)}</td>
                                        <td style="text-align:right;">${nf(map[3].t)}</td>
                                        <td style="text-align:right;">${nf(map[3].l)}</td>
                                    </tr>
                                    <tr>
                                        <td style="text-align:center;"><b>เลขวิ่ง</b></td>
                                        <td style="text-align:right;">${nf(map[1].h)}</td>
                                        <td style="text-align:center;">-</td>
                                        <td style="text-align:right;">${nf(map[1].l)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>`;
                    $el.html(html);
                    return;
                }

                // 9. setlimitnumber.php, showlimitnumber.php, showlimitnumber_1.php
                if (baseFile === 'setlimitnumber.php') {
                    const html = `
                    <div class="row" style="margin-top:15px;">
                        <div class="col-md-6">
                            <div class="panel panel-warning">
                                <div class="panel-heading"><b>กำหนดเลขอั้น (จ่ายครึ่งราคา)</b></div>
                                <div class="panel-body">
                                    <div class="form-inline" style="text-align:center;">
                                        <input type="text" id="txtlimitpay" class="form-control" maxlength="3" placeholder="กรอกเลขอั้น" style="width:140px;text-align:center;font-size:18px;">
                                        &nbsp;<label><input type="checkbox" id="Chconvert_num"> กลับทุกประตู</label>&nbsp;
                                        <button type="button" class="btn btn-warning" onclick="addLimitPay()">บันทึกเลขอั้น</button>
                                    </div>
                                    <hr>
                                    <div id="box_half_list"></div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="panel panel-danger">
                                <div class="panel-heading"><b>กำหนดเลขไม่รับ (ปิดรับแทง)</b></div>
                                <div class="panel-body">
                                    <div class="form-inline" style="text-align:center;">
                                        <input type="text" id="txtlimitclose" class="form-control" maxlength="3" placeholder="กรอกเลขไม่รับ" style="width:140px;text-align:center;font-size:18px;">
                                        &nbsp;<label><input type="checkbox" id="Chconvert_num1"> กลับทุกประตู</label>&nbsp;
                                        <button type="button" class="btn btn-danger" onclick="addLimitClose()">บันทึกเลขไม่รับ</button>
                                    </div>
                                    <hr>
                                    <div id="box_close_list"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <script>
                        function addLimitPay() {
                            var n = $('#txtlimitpay').val().trim();
                            if (!n) return;
                            $.ajax({
                                method: 'POST', url: 'lotto.php',
                                data: { setlimitpaynumber: 'ok', txtnumbe: n, Chconvert_num: $('#Chconvert_num').is(':checked') },
                                success: function(res) {
                                    $('#txtlimitpay').val('').focus();
                                    $('#box_half_list').load('showlimitnumber.php');
                                }
                            });
                        }
                        function addLimitClose() {
                            var n = $('#txtlimitclose').val().trim();
                            if (!n) return;
                            $.ajax({
                                method: 'POST', url: 'lotto.php',
                                data: { setlimitnumber: 'ok', txtnumbe: n, Chconvert_num1: $('#Chconvert_num1').is(':checked') },
                                success: function(res) {
                                    $('#txtlimitclose').val('').focus();
                                    $('#box_close_list').load('showlimitnumber_1.php');
                                    $('#newkey').load('newkey_num.php');
                                }
                            });
                        }
                        function delLimitItem(id) {
                            $.ajax({
                                method: 'POST', url: 'lotto.php',
                                data: { dellimit: id },
                                success: function() {
                                    $('#box_half_list').load('showlimitnumber.php');
                                    $('#box_close_list').load('showlimitnumber_1.php');
                                    $('#newkey').load('newkey_num.php');
                                }
                            });
                        }
                        $('#box_half_list').load('showlimitnumber.php');
                        $('#box_close_list').load('showlimitnumber_1.php');
                    <\/script>`;
                    $el.html(html);
                    return;
                }

                if (baseFile === 'showlimitnumber.php' || baseFile === 'showlimitnumber_1.php') {
                    const ltype = baseFile === 'showlimitnumber.php' ? 'จ่ายครึ่ง' : 'ไม่รับ';
                    const { data: rows } = await sb.from('limit_numbers').select('*').eq('date_sale', ds).eq('limit_type', ltype).order('num', { ascending: true });
                    let trs = '';
                    (rows || []).forEach((r, i) => {
                        trs += `<tr>
                            <td style="text-align:center;">${i + 1}</td>
                            <td style="text-align:center;font-size:16px;"><b>${esc(r.num)}</b></td>
                            <td style="text-align:center;"><span class="label ${ltype === 'จ่ายครึ่ง' ? 'label-warning' : 'label-danger'}">${esc(r.limit_type)}</span></td>
                            <td style="text-align:center;"><button class="btn btn-danger btn-xs" onclick="delLimitItem(${r.id})">ลบ</button></td>
                        </tr>`;
                    });
                    $el.html(`
                    <table class="table table-bordered table-hover">
                        <thead><tr><th style="text-align:center;">ลำดับ</th><th style="text-align:center;">หมายเลข</th><th style="text-align:center;">สถานะ</th><th style="text-align:center;">ลบ</th></tr></thead>
                        <tbody>${trs || '<tr><td colspan="4" style="text-align:center;color:#999;">ไม่มีรายการ</td></tr>'}</tbody>
                    </table>`);
                    return;
                }

                // 10. showresult.php
                if (baseFile === 'showresult.php') {
                    const ctx = await fetchContextData(sb, ds);
                    const r = ctx.resultRow;
                    let trs = '';
                    if (r && String(r.hight || '').trim() !== '') {
                        trs = `<tr style="font-size:18px;font-weight:bold;">
                            <td style="text-align:center;color:#d9534f;">${esc(r.hight)}</td>
                            <td style="text-align:center;">${esc(r.Tlow1)}</td>
                            <td style="text-align:center;">${esc(r.Tlow2)}</td>
                            <td style="text-align:center;">${esc(r.Tlow3)}</td>
                            <td style="text-align:center;">${esc(r.Tlow4)}</td>
                            <td style="text-align:center;color:#007fff;">${esc(r.Twolow)}</td>
                            <td style="text-align:center;">
                                <button type="button" id="editresult" class="btn btn-warning btn-sm"
                                    data-id="${r.id}" data-hight="${esc(r.hight)}"
                                    data-Tlow1="${esc(r.Tlow1)}" data-Tlow2="${esc(r.Tlow2)}"
                                    data-Tlow3="${esc(r.Tlow3)}" data-Tlow4="${esc(r.Tlow4)}"
                                    data-low="${esc(r.Twolow)}">แก้ไข</button>
                                <button type="button" class="btn btn-danger btn-sm" onclick="delresult(${r.id || 0})">ลบ</button>
                            </td>
                        </tr>`;
                    } else {
                        trs = `<tr><td colspan="7" style="text-align:center;color:#888;">ยังไม่ได้บันทึกผลการออกรางวัลงวดนี้</td></tr>`;
                    }

                    $el.html(`
                    <div class="col-md-12">
                        <div class="panel panel-info">
                            <div class="panel-heading">ผลการออกรางวัลงวดประจำวันที่ ${thaiDateLong(ds)}</div>
                            <div class="table-responsive">
                                <table class="table table-hover table-bordered">
                                    <thead>
                                        <tr>
                                            <th style="text-align:center;">3 ตัวบน</th>
                                            <th style="text-align:center;">3 ตัวหน้า ครั้งที่ 1</th>
                                            <th style="text-align:center;">3 ตัวหน้า ครั้งที่ 2</th>
                                            <th style="text-align:center;">3 ตัวหลัง ครั้งที่ 1</th>
                                            <th style="text-align:center;">3 ตัวหลัง ครั้งที่ 2</th>
                                            <th style="text-align:center;">2 ตัวล่าง</th>
                                            <th style="text-align:center;">จัดการ</th>
                                        </tr>
                                    </thead>
                                    <tbody>${trs}</tbody>
                                </table>
                            </div>
                        </div>
                    </div>`);
                    return;
                }

                // 11. resultcheck.php & billdetail_agent_result.php
                if (baseFile === 'resultcheck.php') {
                    const ctx = await fetchContextData(sb, ds);
                    if (!ctx.resultRow || String(ctx.resultRow.hight || '').trim() === '') {
                        $el.html(`<div class="col-md-12"><div class="alert alert-warning" style="text-align:center;font-size:18px;">ยังไม่ได้บันทึกผลการออกรางวัลงวดนี้ กรุณาบันทึกผลรางวัลที่เมนู "บันทึกผลออกรางวัล" ก่อนครับ</div></div>`);
                        return;
                    }
                    const { data: allBets } = await sb.from('bets').select('*').eq('date_sale', ds).order('id', { ascending: true });
                    const winByCus = {};
                    let totalWinAll = 0;

                    (allBets || []).forEach(b => {
                        const c = calcBetRow(b, ctx.cusMap, ctx.resultRow, ctx.halfNums);
                        if (c.is_win) {
                            const cname = (b.cus || 'ไม่ระบุ').trim();
                            if (!winByCus[cname]) winByCus[cname] = [];
                            winByCus[cname].push({ bet: b, calc: c });
                            totalWinAll += c.win;
                        }
                    });

                    const cusNames = Object.keys(winByCus).sort((a, b) => a.localeCompare(b, 'th'));
                    let cards = '';
                    cusNames.forEach(cname => {
                        const items = winByCus[cname];
                        let cusWinSum = 0;
                        let rows = '';
                        items.forEach((it, idx) => {
                            cusWinSum += it.calc.win;
                            rows += `<tr>
                                <td style="text-align:center;">${idx + 1}</td>
                                <td style="text-align:center;">บิลที่ ${esc(it.bet.bill || '001')}</td>
                                <td style="text-align:center;font-size:16px;color:red;"><b>${esc(it.bet.num)}</b> ${it.calc.is_half ? '<span class="label label-warning">ครึ่งราคา</span>' : ''}</td>
                                <td style="text-align:center;"><span class="label label-success">${esc(it.calc.hit_types.join(' + '))}</span></td>
                                <td style="text-align:right;">${nf(it.bet.bet1)}</td>
                                <td style="text-align:right;">${nf(it.bet.bet2)}</td>
                                <td style="text-align:right;">${nf(it.bet.bet3)}</td>
                                <td style="text-align:right;color:red;font-weight:bold;">${nf(it.calc.win)}</td>
                            </tr>`;
                        });

                        cards += `
                        <div class="panel panel-danger" style="margin: 10px 15px;">
                            <div class="panel-heading">
                                <b>สาย: ${esc(cname)}</b> — ถูกรางวัลรวม: <b style="color:red;font-size:18px;">${nf(cusWinSum)}</b> บาท
                            </div>
                            <div class="table-responsive">
                                <table class="table table-bordered table-condensed">
                                    <thead>
                                        <tr style="background:#f9f9f9;">
                                            <th style="text-align:center;">ลำดับ</th>
                                            <th style="text-align:center;">บิลย่อย</th>
                                            <th style="text-align:center;">เลขที่ถูก</th>
                                            <th style="text-align:center;">ประเภทรางวัล</th>
                                            <th style="text-align:right;">บน/เต็ง</th>
                                            <th style="text-align:right;">ล่าง/โต๊ด</th>
                                            <th style="text-align:right;">3ตัวล่าง</th>
                                            <th style="text-align:right;">ยอดเงินรางวัล</th>
                                        </tr>
                                    </thead>
                                    <tbody>${rows}</tbody>
                                </table>
                            </div>
                        </div>`;
                    });

                    $el.html(`
                    <div class="col-md-12">
                        <div class="alert alert-info" style="font-size:18px;text-align:center;">
                            ผลรางวัลงวดนี้ — <b>3 ตัวบน: <span style="color:red">${esc(ctx.resultRow.hight)}</span></b> |
                            <b>3 ตัวล่าง: ${esc(ctx.resultRow.Tlow1)}, ${esc(ctx.resultRow.Tlow2)}, ${esc(ctx.resultRow.Tlow3)}, ${esc(ctx.resultRow.Tlow4)}</b> |
                            <b>2 ตัวล่าง: <span style="color:blue">${esc(ctx.resultRow.Twolow)}</span></b>
                            — รวมยอดถูกรางวัลทั้งหมด: <b style="color:red">${nf(totalWinAll)}</b> บาท
                        </div>
                        ${cards || '<div class="alert alert-success" style="text-align:center;">ไม่มีรายการบิลที่ถูกรางวัลในงวดนี้</div>'}
                    </div>`);
                    return;
                }

                // 12. paymentlist.php (เพิ่ม User ช่วยกรอก แบบไม่จำกัดวัน)
                if (baseFile === 'paymentlist.php') {
                    const { data: urows } = await sb.from('users').select('*').order('id', { ascending: true });
                    let tbody = '';
                    (urows || []).forEach((u, i) => {
                        const roleBadge = u.role === 'Main' ? '<span class="label label-primary">ผู้ดูแลหลัก (Main)</span>' : '<span class="label label-info">ผู้ช่วยคีย์ (User)</span>';
                        const delBtn = u.username === 'cf1412' ? '' : `<button type="button" class="btn btn-danger btn-xs" onclick="delSubUser(${u.id}, '${esc(u.username)}')">ลบ</button>`;
                        tbody += `<tr>
                            <td style="text-align:center;">${i + 1}</td>
                            <td style="text-align:center;"><b>${esc(u.username)}</b></td>
                            <td style="text-align:center;"><code>${esc(u.password)}</code></td>
                            <td style="text-align:center;">${roleBadge}</td>
                            <td style="text-align:center;color:green;font-weight:bold;">ไม่จำกัดวัน</td>
                            <td style="text-align:center;">
                                <button type="button" class="btn btn-warning btn-xs" onclick="editSubUser(${u.id}, '${esc(u.username)}', '${esc(u.password)}', '${esc(u.role)}')">แก้ไข</button>
                                ${delBtn}
                            </td>
                        </tr>`;
                    });

                    $el.html(`
                    <div class="col-md-12">
                        <div class="panel panel-primary">
                            <div class="panel-heading">จัดการผู้ใช้งาน (เพิ่ม / แก้ไข / ลบ User แบบไม่จำกัดวัน)</div>
                            <div class="panel-body">
                                <input type="hidden" id="subuser_id" value="0">
                                <div class="row">
                                    <div class="col-md-3">
                                        <label>ชื่อผู้ใช้ (Username)</label>
                                        <input type="text" id="subuser_name" class="form-control" placeholder="เช่น cf1412_2">
                                    </div>
                                    <div class="col-md-3">
                                        <label>รหัสผ่าน (Password)</label>
                                        <input type="text" id="subuser_pass" class="form-control" placeholder="กรอกรหัสผ่าน">
                                    </div>
                                    <div class="col-md-3">
                                        <label>สิทธิ์การใช้งาน</label>
                                        <select id="subuser_role" class="form-control">
                                            <option value="user">ผู้ช่วยกรอกข้อมูล (User)</option>
                                            <option value="Main">ผู้ดูแลระบบหลัก (Main)</option>
                                        </select>
                                    </div>
                                    <div class="col-md-3" style="margin-top:25px;">
                                        <button type="button" id="btn_save_subuser" class="btn btn-success" onclick="saveSubUser()">+ เพิ่ม User (ไม่จำกัดวัน)</button>
                                        <button type="button" class="btn btn-default" onclick="resetSubUserForm()">ล้างค่า</button>
                                    </div>
                                </div>
                                <hr>
                                <div class="table-responsive">
                                    <table class="table table-bordered table-hover">
                                        <thead>
                                            <tr style="background:#f5f5f5;">
                                                <th style="text-align:center;">ลำดับ</th>
                                                <th style="text-align:center;">Username</th>
                                                <th style="text-align:center;">Password</th>
                                                <th style="text-align:center;">ระดับสิทธิ์</th>
                                                <th style="text-align:center;">วันใช้งานคงเหลือ</th>
                                                <th style="text-align:center;">จัดการ</th>
                                            </tr>
                                        </thead>
                                        <tbody>${tbody}</tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                    <script>
                        function saveSubUser() {
                            var id = parseInt($('#subuser_id').val(), 10) || 0;
                            var u = $('#subuser_name').val().trim();
                            var p = $('#subuser_pass').val().trim();
                            var r = $('#subuser_role').val();
                            if (!u || !p) { swal('กรุณากรอก Username และ Password', '', 'warning'); return; }
                            var payload = id > 0 ? { editsubuser: 'ok', id: id, user: u, pass: p, role: r } : { addsubuser: 'ok', user: u, pass: p, role: r };
                            $.ajax({
                                method: 'POST', url: 'lotto.php', data: payload,
                                success: function(res) {
                                    if ($.trim(res) === 'ok') {
                                        swal('บันทึก User เรียบร้อย', '', 'success');
                                        $('#userlist_payment').load('paymentlist.php');
                                    } else if ($.trim(res) === 'dup') {
                                        swal('Username นี้มีในระบบแล้ว', '', 'error');
                                    }
                                }
                            });
                        }
                        function editSubUser(id, u, p, r) {
                            $('#subuser_id').val(id);
                            $('#subuser_name').val(u);
                            $('#subuser_pass').val(p);
                            $('#subuser_role').val(r);
                            $('#btn_save_subuser').text('บันทึกการแก้ไข User').removeClass('btn-success').addClass('btn-warning');
                        }
                        function resetSubUserForm() {
                            $('#subuser_id').val('0');
                            $('#subuser_name').val('');
                            $('#subuser_pass').val('');
                            $('#subuser_role').val('user');
                            $('#btn_save_subuser').text('+ เพิ่ม User (ไม่จำกัดวัน)').removeClass('btn-warning').addClass('btn-success');
                        }
                        function delSubUser(id, u) {
                            swal({
                                title: 'ยืนยันการลบ User: ' + u + ' ?',
                                type: 'warning', showCancelButton: true,
                                confirmButtonText: 'ลบ', cancelButtonText: 'ยกเลิก'
                            }).then(function(res) {
                                if (res.value) {
                                    $.ajax({
                                        method: 'POST', url: 'lotto.php',
                                        data: { delsubuser: 'ok', id: id },
                                        success: function() { $('#userlist_payment').load('paymentlist.php'); }
                                    });
                                }
                            });
                        }
                    <\/script>`);
                    return;
                }

                // 13. setuppay_list.php (ข้อมูลลูกค้า)
                if (baseFile === 'setuppay_list.php') {
                    const { data: crows } = await sb.from('customers').select('*').order('name', { ascending: true });
                    let tbody = '';
                    (crows || []).forEach(r => {
                        tbody += `<tr>
                            <td style="text-align: left; padding: 4px 0px 0px 5px;">${esc(r.name)}</td>
                            <td style="text-align: center;padding: 4px 0px 0px 0px;">${parseFloat(r.per1)}</td>
                            <td style="text-align: center;padding: 4px 0px 0px 0px;">${parseFloat(r.per2)}</td>
                            <td style="text-align: center;padding: 4px 0px 0px 0px;">${parseFloat(r.per3)}</td>
                            <td style="text-align: center;padding: 4px 0px 0px 0px;">${parseFloat(r.per3tose)}</td>
                            <td style="text-align: center;padding: 4px 0px 0px 0px;">${parseFloat(r.per3tlow)}</td>
                            <td style="text-align: center;padding: 4px 0px 0px 0px;">${parseFloat(r.pay1hight)}</td>
                            <td style="text-align: center;padding: 4px 0px 0px 0px;">${parseFloat(r.pay1low)}</td>
                            <td style="text-align: center;padding: 4px 0px 0px 0px;">${parseFloat(r.pay2)}</td>
                            <td style="text-align: center;padding: 4px 0px 0px 0px;">${parseFloat(r.pay3)}</td>
                            <td style="text-align: center;padding: 4px 0px 0px 0px;">${parseFloat(r.paytose)}</td>
                            <td style="text-align: center;padding: 4px 0px 0px 0px;">${parseFloat(r.paytlow)}</td>
                            <td style="text-align: center;padding: 0px 0px 0px 0px;">
                                <a href="javascript:void(0)" id="setpayedit" class="btn btn-warning btn-sm"
                                   data-id="${r.id}" data-name="${esc(r.name)}"
                                   data-per1="${parseFloat(r.per1)}" data-per2="${parseFloat(r.per2)}"
                                   data-per3="${parseFloat(r.per3)}" data-per3tose="${parseFloat(r.per3tose)}"
                                   data-per3tlow="${parseFloat(r.per3tlow)}" data-pay1hight="${parseFloat(r.pay1hight)}"
                                   data-pay1low="${parseFloat(r.pay1low)}" data-pay2="${parseFloat(r.pay2)}"
                                   data-pay3="${parseFloat(r.pay3)}" data-paytose="${parseFloat(r.paytose)}"
                                   data-paytlow="${parseFloat(r.paytlow)}">แก้ไข</a>&nbsp;
                                <a href="javascript:void(0)" id="setpaydel" class="btn btn-danger btn-sm" data-id="${r.id}">ลบ</a>
                            </td>
                        </tr>`;
                    });

                    $el.html(`
                    <div class="row">
                        <div class="col-md-12" style="margin-left: 15px;margin-right: 15px;">
                            <div class="panel panel-info">
                                <div class="panel-heading">รายการจัดการ </div>
                                <div class="table-responsive">
                                    <table class="table table-hover table-bordered">
                                        <thead>
                                            <tr>
                                                <th style="text-align: center;">ชื่อสายที่กำหนดขาย</th>
                                                <th style="text-align: center;">%วิ่ง</th>
                                                <th style="text-align: center;">%2ตัว</th>
                                                <th style="text-align: center;">%3ตัวตรง</th>
                                                <th style="text-align: center;">%3ตัวโต๊ต</th>
                                                <th style="text-align: center;">%3ตัวล่าง</th>
                                                <th style="text-align: center;">จ่ายวิ่งบน</th>
                                                <th style="text-align: center;">จ่ายวิ่งล่าง</th>
                                                <th style="text-align: center;">จ่าย 2ตัว</th>
                                                <th style="text-align: center;">จ่าย3ตัวตรง</th>
                                                <th style="text-align: center;">จ่าย3ตัวโต๊ต</th>
                                                <th style="text-align: center;">จ่าย3ตัวล่าง</th>
                                                <th style="text-align: center;">จัดการ</th>
                                            </tr>
                                        </thead>
                                        <tbody>${tbody}</tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>`);
                    return;
                }

                if (baseFile === 'setuppay.php') {
                    $('#showlistpay').load('setuppay_list.php');
                    return;
                }

                // 14. log.php
                if (baseFile === 'log.php') {
                    return;
                }
            } catch (e) {
                console.error('Error loading view:', baseFile, e);
            }
        })();

        return this;
    };
})();
