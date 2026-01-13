/**
 * Debug Authentication Script
 * 
 * Run this in the browser console to diagnose authentication issues
 */

console.log('=== AUTHENTICATION DIAGNOSTIC ===\n');

// Check localStorage
const authStorage = localStorage.getItem('admin-auth-storage');
if (authStorage) {
  try {
    const auth = JSON.parse(authStorage);
    console.log('✅ localStorage data found:');
    console.log('  - Token exists:', !!auth.state?.token);
    console.log('  - Token length:', auth.state?.token?.length || 0);
    console.log('  - Token preview:', auth.state?.token?.substring(0, 20) + '...' || 'none');
    console.log('  - Is authenticated:', auth.state?.isAuthenticated);
    console.log('  - User email:', auth.state?.user?.email || 'none');
    console.log('  - User role:', auth.state?.user?.role || 'none');
    console.log('\nFull auth state:', auth);
  } catch (e) {
    console.error('❌ Failed to parse localStorage:', e);
  }
} else {
  console.log('❌ No auth data in localStorage');
  console.log('   → You need to log in first');
}

// Check cookies
console.log('\n=== COOKIES ===');
const cookies = document.cookie.split(';').reduce((acc, cookie) => {
  const [key, value] = cookie.trim().split('=');
  acc[key] = value;
  return acc;
}, {});
console.log('All cookies:', cookies);
console.log('admin-token cookie:', cookies['admin-token'] ? '✅ Found' : '❌ Missing');

// Test API endpoint
console.log('\n=== TESTING API ENDPOINT ===');
fetch('/api/admin/auth/me', {
  credentials: 'include',
})
  .then(res => res.json())
  .then(data => {
    if (data.user) {
      console.log('✅ /api/admin/auth/me: Authenticated');
      console.log('   User:', data.user);
    } else {
      console.log('❌ /api/admin/auth/me: Not authenticated');
      console.log('   Error:', data.error);
    }
  })
  .catch(err => {
    console.error('❌ Failed to test API:', err);
  });

// Instructions
console.log('\n=== NEXT STEPS ===');
console.log('1. If token is missing: Log out and log back in');
console.log('2. If cookie is missing: Check browser settings (cookies enabled?)');
console.log('3. Check Network tab when uploading to see request headers');
console.log('4. Look for "Authorization: Bearer ..." in request headers');
