/**
 * Manual RBAC Testing Script
 * 
 * Tests role hierarchy and authorization logic
 * Run with: npx tsx scripts/test-rbac.ts
 */

import { 
  hasRequiredRole, 
  requireRole, 
  hasPermission, 
  getRoleLevel,
  isValidRole,
  getRolesAtOrAbove,
} from '../lib/auth/rbac';

console.log('🧪 Testing RBAC Role Hierarchy and Authorization\n');

// Test 1: Role Hierarchy
console.log('📊 Test 1: Role Hierarchy Levels');
console.log('viewer:', getRoleLevel('viewer'));
console.log('manager:', getRoleLevel('manager'));
console.log('admin:', getRoleLevel('admin'));
console.log('super_admin:', getRoleLevel('super_admin'));
console.log('');

// Test 2: hasRequiredRole - Higher roles can access lower requirements
console.log('✅ Test 2: Higher roles can access lower requirements');
console.log('super_admin → viewer:', hasRequiredRole('super_admin', 'viewer'));
console.log('admin → manager:', hasRequiredRole('admin', 'manager'));
console.log('manager → viewer:', hasRequiredRole('manager', 'viewer'));
console.log('');

// Test 3: hasRequiredRole - Lower roles cannot access higher requirements
console.log('❌ Test 3: Lower roles cannot access higher requirements');
console.log('viewer → manager:', hasRequiredRole('viewer', 'manager'));
console.log('viewer → admin:', hasRequiredRole('viewer', 'admin'));
console.log('manager → admin:', hasRequiredRole('manager', 'admin'));
console.log('');

// Test 4: Same role access
console.log('✅ Test 4: Same role can access same requirement');
console.log('viewer → viewer:', hasRequiredRole('viewer', 'viewer'));
console.log('admin → admin:', hasRequiredRole('admin', 'admin'));
console.log('');

// Test 5: requireRole - Multiple roles
console.log('✅ Test 5: requireRole with multiple allowed roles');
console.log('admin in [admin, super_admin]:', requireRole('admin', ['admin', 'super_admin']));
console.log('viewer in [admin, super_admin]:', requireRole('viewer', ['admin', 'super_admin']));
console.log('');

// Test 6: Permissions
console.log('🔐 Test 6: Permission Checking');
console.log('viewer can view_dashboard:', hasPermission('viewer', 'view_dashboard'));
console.log('viewer can manage_products:', hasPermission('viewer', 'manage_products'));
console.log('manager can manage_orders:', hasPermission('manager', 'manage_orders'));
console.log('admin can manage_products:', hasPermission('admin', 'manage_products'));
console.log('admin can manage_users:', hasPermission('admin', 'manage_users'));
console.log('super_admin can manage_users:', hasPermission('super_admin', 'manage_users'));
console.log('');

// Test 7: Route Authorization Scenarios
console.log('🛣️  Test 7: Route Authorization Scenarios');
console.log('GET /api/admin/products (viewer):', hasRequiredRole('viewer', 'viewer'));
console.log('POST /api/admin/products (viewer):', hasRequiredRole('viewer', 'admin'));
console.log('POST /api/admin/products (admin):', hasRequiredRole('admin', 'admin'));
console.log('GET /api/admin/orders (viewer):', hasRequiredRole('viewer', 'manager'));
console.log('GET /api/admin/orders (manager):', hasRequiredRole('manager', 'manager'));
console.log('POST /api/admin/upload (admin):', hasRequiredRole('admin', 'admin'));
console.log('POST /api/admin/upload (viewer):', hasRequiredRole('viewer', 'admin'));
console.log('');

// Test 8: Invalid roles
console.log('⚠️  Test 8: Invalid Role Handling');
console.log('isValidRole("editor"):', isValidRole('editor')); // Old role
console.log('isValidRole("viewer"):', isValidRole('viewer'));
console.log('isValidRole("invalid"):', isValidRole('invalid'));
console.log('hasRequiredRole("editor", "viewer"):', hasRequiredRole('editor', 'viewer')); // Should be false
console.log('');

// Test 9: Role hierarchy order
console.log('📈 Test 9: Role Hierarchy Order Verification');
const viewerLevel = getRoleLevel('viewer');
const managerLevel = getRoleLevel('manager');
const adminLevel = getRoleLevel('admin');
const superAdminLevel = getRoleLevel('super_admin');

console.log('Hierarchy check:');
console.log(`  viewer (${viewerLevel}) < manager (${managerLevel}):`, viewerLevel < managerLevel);
console.log(`  manager (${managerLevel}) < admin (${adminLevel}):`, managerLevel < adminLevel);
console.log(`  admin (${adminLevel}) < super_admin (${superAdminLevel}):`, adminLevel < superAdminLevel);
console.log('');

// Test 10: Roles at or above level
console.log('📋 Test 10: Roles at or above level');
console.log('Roles >= level 1:', getRolesAtOrAbove(1));
console.log('Roles >= level 3:', getRolesAtOrAbove(3));
console.log('');

// Summary
console.log('📊 Test Summary');
const tests = [
  { name: 'Role hierarchy levels', pass: getRoleLevel('super_admin') === 4 },
  { name: 'Higher roles access lower', pass: hasRequiredRole('admin', 'viewer') },
  { name: 'Lower roles blocked from higher', pass: !hasRequiredRole('viewer', 'admin') },
  { name: 'Same role access', pass: hasRequiredRole('admin', 'admin') },
  { name: 'Permission checking', pass: hasPermission('admin', 'manage_products') },
  { name: 'Invalid role handling', pass: !isValidRole('editor') },
];

const passed = tests.filter(t => t.pass).length;
const total = tests.length;

console.log(`\n✅ Passed: ${passed}/${total}`);
tests.forEach(test => {
  console.log(`  ${test.pass ? '✅' : '❌'} ${test.name}`);
});

if (passed === total) {
  console.log('\n🎉 All RBAC tests passed!');
  process.exit(0);
} else {
  console.log('\n⚠️  Some tests failed. Review the output above.');
  process.exit(1);
}
