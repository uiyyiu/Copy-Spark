// 1. تهيئة Supabase Client
// استبدل القيم أدناه بالبيانات الخاصة بمشروعك من Supabase Dashboard -> Settings -> API
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// التحقق من وجود المكتبة
if (typeof supabase === 'undefined') {
    console.error('Supabase library not loaded! Check your internet connection or CDN link.');
}

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// دالة مساعدة لعرض الرسائل في صفحة تسجيل الدخول
function showMessage(text, type) {
    const msgDiv = document.getElementById('message');
    if (msgDiv) {
        msgDiv.style.display = 'block';
        msgDiv.textContent = text;
        msgDiv.className = type; // 'success' or 'error'
    } else {
        if(type === 'error') alert(text);
    }
}

// 2. دالة تسجيل الدخول عبر الرابط السحري (Magic Link)
async function signIn() {
    const email = document.getElementById('email').value;
    
    if (!email) {
        showMessage('الرجاء إدخال البريد الإلكتروني', 'error');
        return;
    }

    showMessage('جاري الإرسال...', 'success');

    const { data, error } = await _supabase.auth.signInWithOtp({
        email: email,
        options: {
            // هذا الرابط هو الذي سيعود إليه المستخدم بعد الضغط على الرابط في الإيميل
            emailRedirectTo: window.location.origin + '/dashboard.html',
        },
    });

    if (error) {
        showMessage('حدث خطأ: ' + error.message, 'error');
    } else {
        showMessage('تم إرسال رابط الدخول إلى بريدك الإلكتروني! تحقق منه.', 'success');
    }
}

// 3. دالة تسجيل الدخول عبر Google
async function signInWithGoogle() {
    const { data, error } = await _supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin + '/dashboard.html'
        }
    });

    if (error) {
        showMessage('خطأ في تسجيل الدخول بجوجل: ' + error.message, 'error');
    }
}

// 4. دالة تسجيل الخروج
async function logout() {
    const { error } = await _supabase.auth.signOut();
    if (error) {
        console.error('Error logging out:', error);
    } else {
        // التوجيه لصفحة الدخول بعد الخروج
        window.location.href = 'login.html';
    }
}

// 5. دالة فحص الجلسة (لصفحة Dashboard)
async function checkSession() {
    const { data: { session } } = await _supabase.auth.getSession();

    // تحديد الصفحة الحالية
    const currentPage = window.location.pathname;
    const isDashboard = currentPage.includes('dashboard.html');
    const isLoginPage = currentPage.includes('login.html') || currentPage === '/' || currentPage.endsWith('/index.html');

    if (session) {
        // المستخدم مسجل الدخول
        if (isDashboard) {
            // عرض الإيميل في لوحة التحكم
            const emailSpan = document.getElementById('user-email');
            if (emailSpan) emailSpan.textContent = session.user.email;
        } else if (isLoginPage) {
            // إذا كان في صفحة الدخول وهو مسجل أصلاً، وجهه للوحة التحكم
            window.location.href = 'dashboard.html';
        }
    } else {
        // المستخدم غير مسجل الدخول
        if (isDashboard) {
            // إذا حاول دخول لوحة التحكم بدون تسجيل، اطرده لصفحة الدخول
            window.location.href = 'login.html';
        }
    }
}

// مستمع لتغيرات حالة المصادقة (Auth State Listener)
// هذا يتعامل تلقائياً مع التوجيه عند تسجيل الدخول أو الخروج
_supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
        if (!window.location.pathname.includes('dashboard.html')) {
            window.location.href = 'dashboard.html';
        }
    }
    if (event === 'SIGNED_OUT') {
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = 'login.html';
        }
    }
});

// تشغيل الفحص المبدئي (مفيد عند كتابة الرابط يدوياً)
// ملاحظة: في login.html لا نستدعيها فوراً لترك المستخدم يكتب، لكن المستمع أعلاه سيقوم بالواجب.
