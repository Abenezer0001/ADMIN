import React from 'react';
const { Suspense, lazy } = React;
import { Routes, Route, Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { PermissionProvider } from './context/PermissionContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Import the PasswordSetup component
import PasswordSetup from './pages/PasswordSetup';
import RestaurantAnalyticsDashboard from './components/RestaurantAnalyticsDashboard';
// Import ResourceDashboard
const ResourceDashboard = lazy(() => import('./pages/ResourceDashboard'));

// Lazy load components
// User Management Components
const UserList = lazy(() => import('./components/users/UserList'));
const UserForm = lazy(() => import('./components/users/UserForm'));
const UserDetail = lazy(() => import('./components/users/UserDetail'));
const UserManagement = lazy(() => import('./components/UserManagement'));
const InventoryManagement = lazy(() => import('./components/InventoryManagement'));
const InvoiceManagement = lazy(() => import('./components/InvoiceManagement'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const RbacDashboard = lazy(() => import('./pages/RbacDashboard'));
const AdminManagement = lazy(() => import('./components/admin/AdminManagement'));

// const RestaurantsPage = lazy(() => import('./components/restaurants/RestaurantsPage'));
const AddRestaurant = lazy(() => import('./components/restaurants/AddRestaurant'));
const RestaurantList = lazy(() => import('./components/restaurants/RestaurantList'));
const RestaurantSettings = lazy(() => import('./components/restaurants/RestaurantSettings'));
const RestaurantDetail = lazy(() => import('./components/restaurants/RestaurantDetail'));

// const TablesPage = lazy(() => import('./components/tables/TablesPage'));
const TableList = lazy(() => import('./components/tables/TablesList'));
const TableDetail = lazy(() => import('./components/tables/TableDetail'));
const TableSettings = lazy(() => import('./components/tables/TableSettings'));
const TableForm = lazy(() => import('./components/tables/TableForm'));

const VenueList = lazy(() => import('./components/venues/VenueList'));
const VenueDetail = lazy(() => import('./components/venues/VenueDetail'));
const VenueSettings = lazy(() => import('./components/venues/VenueSettings'));
const VenueForm = lazy(() => import('./components/venues/VenueForm'));

const ZoneList = lazy(() => import('./components/zones/ZoneList'));
const ZoneDetail = lazy(() => import('./components/zones/ZoneDetail'));
const ZoneSettings = lazy(() => import('./components/zones/ZoneSettings'));
const ZoneForm = lazy(() => import('./components/zones/ZoneForm'));

const Sales = lazy(() => import('./components/sales/Sales'));
const Analytics = lazy(() => import('./components/analytics/Analytics'));

const SidebarSettings = lazy(() => import('./components/SidebarSettings'));
const MenuItems = lazy(() => import('./components/menu/MenuItems'));
const MenuItemsList = lazy(() => import('./components/menu/MenuItemsList'));
const ModifierGroups = lazy(() => import('./components/menu/ModifierGroups'));
const ModifierGroupEdit = lazy(() => import('./components/menu/ModifierGroupEdit'));
const Preferences = lazy(() => import('./components/settings/Preferences'));
const Profile = lazy(() => import('./components/settings/Profile'));
const ChangePassword = lazy(() => import('./components/settings/ChangePassword'));
const MenuItemDetail = lazy(() => import('./pages/MenuItems/MenuItemDetail')); // Added import
const LoyaltySettings = lazy(() => import('./components/loyalty/LoyaltySettings'));
import Notifications from './components/settings/Notifications';

// Existing components
const Items = lazy(() => import('./components/Items'));
const Modifiers = lazy(() => import('./components/Modifiers'));
const MenusByRestaurant = lazy(() => import('./components/MenusByRestaurant'));
const Schedule = lazy(() => import('./components/Schedule'));
const Tables = lazy(() => import('./components/Tables'));

const Integration = lazy(() => import('./components/Integration'));
const SystemSettings = lazy(() => import('./components/SystemSettings'));
const AccessControl = lazy(()=> import('./components/AccessControl'))
const CustomerInsight = lazy(() => import('./components/analytics/CustomerInsight'));
const MenuReport = lazy(() => import('./components/analytics/MenuReport'));
const OrderPerformance = lazy(() => import('./components/analytics/OrderPerformance'));

const LiveOrders = lazy(() => import('./components/LiveOrders'));
const OrderHistory = lazy(() => import('./components/OrdersHistory'));
const OrderDetail = lazy(() => import('./components/OrderDetail'));

const Customers = lazy(()=> import('./components/Customers'));
const Inventory = lazy(()=> import('./components/Inventory'));

const Invoices = lazy(()=> import('./components/Invoices'));
const InvoicesDetail = lazy(()=> import('./components/InvoicesDetail'));

// Modifiers
const ModifierList = lazy(() => import('./components/Modifier/ModifierList'));
const ModifierDetail = lazy(() => import('./components/Modifier/ModifierDetail'));
const ModifierForm = lazy(() => import('./components/Modifier/ModifierForm'));

// Categories
const CategoryList = lazy(() => import('./components/Category/CategoryList'));
const CategoryDetail = lazy(() => import('./components/Category/CategoryDetail'));
const CategoryForm = lazy(() => import('./components/Category/CategoryForm'));

// SubCategories
const SubCategoryList = lazy(() => import('./components/subcategories/SubCategoryList'));
const SubCategoryDetail = lazy(() => import('./components/subcategories/SubCategoryDetail'));
const SubCategoryForm = lazy(() => import('./components/subcategories/SubCategoryForm'));

// SubSubCategories
const SubSubCategoryList = lazy(() => import('./components/subsubcategories/SubSubCategoryList'));
const SubSubCategoryDetail = lazy(() => import('./components/subsubcategories/SubSubCategoryDetail'));
const SubSubCategoryForm = lazy(() => import('./components/subsubcategories/SubSubCategoryForm'));

// Menus
const MenuList = lazy(() => import('./components/menus/MenuList'));
const MenuDetail = lazy(() => import('./components/menus/MenuDetail'));
const MenuForm = lazy(() => import('./components/menus/MenuForm'));

// Business Management
const BusinessList = lazy(() => import('./components/business/BusinessList'));
const BusinessDashboard = lazy(() => import('./components/business/BusinessDashboard'));

const LoadingScreen = () => (
  <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
    <CircularProgress />
  </Box>
);

const AppRoutes = () => {
  return (
    <PermissionProvider>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Default route */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Authentication Routes */}
          <Route path="/password-setup" element={<PasswordSetup />} />

          {/* Dashboard */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <RestaurantAnalyticsDashboard />
            </ProtectedRoute>
          } />
          
          {/* Resource Management Dashboard */}
          <Route path="/resources" element={
            <ProtectedRoute>
              <ResourceDashboard />
            </ProtectedRoute>
          } />

          {/* Analytics */}
          <Route path="/analytics" element={
            <ProtectedRoute resource="analytics" action="read">
              <Analytics />
            </ProtectedRoute>
          } />
          <Route path="/sales" element={
            <ProtectedRoute resource="analytics" action="read">
              <Sales />
            </ProtectedRoute>
          } />

          {/* Admin Management */}
          <Route path="/settings/admins" element={
            <ProtectedRoute resource="user" action="read">
              <AdminManagement />
            </ProtectedRoute>
          } />

          {/* RBAC Dashboard */}
          <Route path="/settings/rbac" element={
            <ProtectedRoute resource="settings" action="read">
              <RbacDashboard />
            </ProtectedRoute>
          } />

          {/* Business Management */}
          <Route path="/business/dashboard" element={
            <ProtectedRoute resource="business" action="read">
              <BusinessDashboard />
            </ProtectedRoute>
          } />
          <Route path="/business/dashboard/:businessId" element={
            <ProtectedRoute resource="business" action="read">
              <BusinessDashboard />
            </ProtectedRoute>
          } />
          <Route path="/business/list" element={
            <ProtectedRoute resource="business" action="read">
              <BusinessList />
            </ProtectedRoute>
          } />
          <Route path="/business/detail/:businessId" element={
            <ProtectedRoute resource="business" action="read">
              <BusinessDashboard />
            </ProtectedRoute>
          } />
          <Route path="/businesses/:businessId" element={
            <ProtectedRoute resource="business" action="read">
              <BusinessDashboard />
            </ProtectedRoute>
          } />
          <Route path="/businesses/:businessId/edit" element={
            <ProtectedRoute resource="business" action="update">
              <BusinessDashboard />
            </ProtectedRoute>
          } />

          {/* Restaurants */}
          {/* <Route path="/restaurants" element={<RestaurantsPage />} /> */}
          <Route path="/restaurants/add" element={
            <ProtectedRoute resource="restaurant" action="create">
              <AddRestaurant />
            </ProtectedRoute>
          } />
          <Route path="/restaurants/add/:id" element={
            <ProtectedRoute resource="restaurant" action="update">
              <AddRestaurant />
            </ProtectedRoute>
          } />
          <Route path="/restaurants/list" element={
            <ProtectedRoute resource="restaurant" action="read">
              <RestaurantList />
            </ProtectedRoute>
          } />
          <Route path="/restaurants/detail/:id" element={
            <ProtectedRoute resource="restaurant" action="read">
              <RestaurantDetail />
            </ProtectedRoute>
          } />
          
          {/* Zones */}
          <Route path="/zones/list" element={
            <ProtectedRoute resource="restaurant" action="read">
              <ZoneList />
            </ProtectedRoute>
          } />
          <Route path="/zones/add" element={
            <ProtectedRoute resource="restaurant" action="create">
              <ZoneForm />
            </ProtectedRoute>
          } />
          <Route path="/zones/add/:venueId/:id" element={
            <ProtectedRoute resource="restaurant" action="update">
              <ZoneForm />
            </ProtectedRoute>
          } />
          <Route path="/zones/:id" element={
            <ProtectedRoute resource="restaurant" action="read">
              <ZoneSettings />
            </ProtectedRoute>
          } />
          <Route path="/zones/detail/:id" element={
            <ProtectedRoute resource="restaurant" action="read">
              <ZoneDetail />
            </ProtectedRoute>
          } />

          {/* Tables */}
          <Route path="/tables/list" element={
            <ProtectedRoute resource="restaurant" action="read">
              <TableList />
            </ProtectedRoute>
          } />
          <Route path="/tables/new" element={
            <ProtectedRoute resource="restaurant" action="create">
              <TableForm title="Add New Table" />
            </ProtectedRoute>
          } />
          <Route path="/tables/edit/:id" element={
            <ProtectedRoute resource="restaurant" action="update">
              <TableForm title="Edit Table" />
            </ProtectedRoute>
          } />
          <Route path="/tables/detail/:id" element={
            <ProtectedRoute resource="restaurant" action="read">
              <TableDetail />
            </ProtectedRoute>
          } />
          <Route path="/tables/:id" element={
            <ProtectedRoute resource="restaurant" action="read">
              <TableDetail />
            </ProtectedRoute>
          } />

          {/* Venues */}
          <Route path="/venues/list" element={
            <ProtectedRoute resource="restaurant" action="read">
              <VenueList />
            </ProtectedRoute>
          } />
          <Route path="/venues/add" element={
            <ProtectedRoute resource="restaurant" action="create">
              <VenueForm />
            </ProtectedRoute>
          } />
          <Route path="/venues/add/:id" element={
            <ProtectedRoute resource="restaurant" action="update">
              <VenueForm />
            </ProtectedRoute>
          } />
          <Route path="/venues/detail/:id" element={
            <ProtectedRoute resource="restaurant" action="read">
              <VenueDetail />
            </ProtectedRoute>
          } />
          <Route path="/venues/settings/:id" element={
            <ProtectedRoute resource="restaurant" action="update">
              <VenueSettings />
            </ProtectedRoute>
          } />

          {/* Analytics Routes */}
          <Route path="/analytics/customer-insight" element={
            <ProtectedRoute resource="analytics" action="read">
              <CustomerInsight />
            </ProtectedRoute>
          } />
          <Route path="/analytics/menu-report" element={
            <ProtectedRoute resource="analytics" action="read">
              <MenuReport />
            </ProtectedRoute>
          } />
          <Route path="/analytics/order-performance" element={
            <ProtectedRoute resource="analytics" action="read">
              <OrderPerformance />
            </ProtectedRoute>
          } />

          {/* Menu Management */}
          <Route path="/items" element={
            <ProtectedRoute resource="menuitem" action="read">
              <Items />
            </ProtectedRoute>
          } />
          <Route path="/modifiers" element={
            <ProtectedRoute resource="menuitem" action="read">
              <Modifiers />
            </ProtectedRoute>
          } />
          <Route path="/menus" element={
            <ProtectedRoute resource="menu" action="read">
              <MenusByRestaurant />
            </ProtectedRoute>
          } />
          <Route path="/menu/items" element={
            <ProtectedRoute resource="menuitem" action="read">
              <MenuItemsList />
            </ProtectedRoute>
          } />
          <Route path="/menu/items/new" element={
            <ProtectedRoute resource="menuitem" action="create">
              <MenuItems />
            </ProtectedRoute>
          } />
          <Route path="/menu/items/edit/:id" element={
            <ProtectedRoute resource="menuitem" action="update">
              <MenuItems />
            </ProtectedRoute>
          } />
          <Route path="/menu-items/detail/:id" element={
            <ProtectedRoute resource="menuitem" action="read">
              <MenuItemDetail />
            </ProtectedRoute>
          } />
          <Route path="/menu/modifiers" element={
            <ProtectedRoute resource="menuitem" action="read">
              <ModifierGroups />
            </ProtectedRoute>
          } />
          <Route path="/menu/modifiers/:id" element={
            <ProtectedRoute resource="menuitem" action="update">
              <ModifierGroupEdit />
            </ProtectedRoute>
          } />
          <Route path="/menu/modifiers/new" element={
            <ProtectedRoute resource="menuitem" action="create">
              <ModifierGroupEdit />
            </ProtectedRoute>
          } />

          {/* Menus */}
          <Route path="/menus/list" element={
            <ProtectedRoute resource="menu" action="read">
              <MenuList />
            </ProtectedRoute>
          } />
          <Route path="/menus/add" element={
            <ProtectedRoute resource="menu" action="create">
              <MenuForm title="Add New Menu" />
            </ProtectedRoute>
          } />
          <Route path="/menus/edit/:id" element={
            <ProtectedRoute resource="menu" action="update">
              <MenuForm title="Edit Menu" />
            </ProtectedRoute>
          } />
          <Route path="/menus/detail/:id" element={
            <ProtectedRoute resource="menu" action="read">
              <MenuDetail />
            </ProtectedRoute>
          } />

          {/* Orders */}
          <Route path="/schedule" element={
            <ProtectedRoute resource="order" action="read">
              <Schedule />
            </ProtectedRoute>
          } />
          <Route path="/tables" element={
            <ProtectedRoute resource="restaurant" action="read">
              <Tables />
            </ProtectedRoute>
          } />

          {/* Invoices */}
          <Route path="/invoices" element={
            <ProtectedRoute resource="order" action="read">
              <Invoices />
            </ProtectedRoute>
          } />
          <Route path="/invoices/:id" element={
            <ProtectedRoute resource="order" action="read">
              <InvoicesDetail />
            </ProtectedRoute>
          } />

          {/* Modifiers */}
          <Route path="/modifiers" element={
            <ProtectedRoute resource="menuitem" action="read">
              <ModifierList />
            </ProtectedRoute>
          } />
          <Route path="/modifiers/add" element={
            <ProtectedRoute resource="menuitem" action="create">
              <ModifierForm />
            </ProtectedRoute>
          } />
          <Route path="/modifiers/edit/:id" element={
            <ProtectedRoute resource="menuitem" action="update">
              <ModifierForm />
            </ProtectedRoute>
          } />
          <Route path="/modifiers/detail/:id" element={
            <ProtectedRoute resource="menuitem" action="read">
              <ModifierDetail />
            </ProtectedRoute>
          } />

          {/* Categories */}
          <Route path="/categories" element={
            <ProtectedRoute resource="category" action="read">
              <CategoryList />
            </ProtectedRoute>
          } />
          <Route path="/categories/add" element={
            <ProtectedRoute resource="category" action="create">
              <CategoryForm />
            </ProtectedRoute>
          } />
          <Route path="/categories/edit/:id" element={
            <ProtectedRoute resource="category" action="update">
              <CategoryForm />
            </ProtectedRoute>
          } />
          <Route path="/categories/detail/:id" element={
            <ProtectedRoute resource="category" action="read">
              <CategoryDetail />
            </ProtectedRoute>
          } />

          {/* SubCategories */}
          <Route path="/subcategories/list" element={
            <ProtectedRoute resource="category" action="read">
              <SubCategoryList />
            </ProtectedRoute>
          } />
          <Route path="/subcategories/add" element={
            <ProtectedRoute resource="category" action="create">
              <SubCategoryForm title="Add New Sub-Category" />
            </ProtectedRoute>
          } />
          <Route path="/subcategories/edit/:id" element={
            <ProtectedRoute resource="category" action="update">
              <SubCategoryForm title="Edit Sub-Category" />
            </ProtectedRoute>
          } />
          <Route path="/subcategories/detail/:id" element={
            <ProtectedRoute resource="category" action="read">
              <SubCategoryDetail />
            </ProtectedRoute>
          } />

          {/* SubSubCategories */}
          <Route path="/subsubcategories/list" element={
            <ProtectedRoute resource="category" action="read">
              <SubSubCategoryList />
            </ProtectedRoute>
          } />
          <Route path="/subsubcategories/add" element={
            <ProtectedRoute resource="category" action="create">
              <SubSubCategoryForm />
            </ProtectedRoute>
          } />
          <Route path="/subsubcategories/edit/:id" element={
            <ProtectedRoute resource="category" action="update">
              <SubSubCategoryForm />
            </ProtectedRoute>
          } />
          <Route path="/subsubcategories/detail/:id" element={
            <ProtectedRoute resource="category" action="read">
              <SubSubCategoryDetail />
            </ProtectedRoute>
          } />

          {/* Settings */}
          <Route path="/settings/preferences" element={
            <ProtectedRoute resource="settings" action="read">
              <Preferences />
            </ProtectedRoute>
          } />
          <Route path="/settings/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/settings/change-password" element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          } />
          <Route path="/settings/sidebar" element={
            <ProtectedRoute>
              <SidebarSettings />
            </ProtectedRoute>
          } />

          {/* Setting & Administration */}
          <Route path="/settings/system" element={
            <ProtectedRoute resource="settings" action="update">
              <SystemSettings />
            </ProtectedRoute>
          } />
          <Route path="/settings/integration" element={
            <ProtectedRoute resource="settings" action="update">
              <Integration />
            </ProtectedRoute>
          } />
          <Route path="/settings/access-control" element={
            <ProtectedRoute resource="settings" action="update">
              <AccessControl />
            </ProtectedRoute>
          } />
          <Route path="/settings/loyalty" element={
            <ProtectedRoute resource="settings" action="update">
              <LoyaltySettings />
            </ProtectedRoute>
          } />
          <Route path="/settings/notifications" element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          } />

          {/* Customer and Inventory */}
          <Route path="/customers" element={
            <ProtectedRoute resource="user" action="read">
              <Customers />
            </ProtectedRoute>
          } />
          <Route path="/inventory" element={
            <ProtectedRoute resource="restaurant" action="read">
              <Inventory />
            </ProtectedRoute>
          } />
          
          {/* Orders */}
          <Route path="/orders/history" element={
            <ProtectedRoute resource="order" action="read">
              <OrderHistory />
            </ProtectedRoute>
          } />
          <Route path="/orders/live" element={
            <ProtectedRoute resource="order" action="read">
              <LiveOrders />
            </ProtectedRoute>
          } />
          <Route path="/orders/history/:id" element={
            <ProtectedRoute resource="order" action="read">
              <OrderDetail />
            </ProtectedRoute>
          } />

          {/* User Management */}
          <Route path="/users" element={
            <ProtectedRoute resource="user" action="read">
              <UserList />
            </ProtectedRoute>
          } />
          <Route path="/users/new" element={
            <ProtectedRoute resource="user" action="create">
              <UserForm />
            </ProtectedRoute>
          } />
          <Route path="/users/edit/:id" element={
            <ProtectedRoute resource="user" action="update">
              <UserForm />
            </ProtectedRoute>
          } />
          <Route path="/users/:id" element={
            <ProtectedRoute resource="user" action="read">
              <UserDetail />
            </ProtectedRoute>
          } />
          <Route path="/users/roles/:id" element={
            <ProtectedRoute resource="user" action="read">
              <UserDetail />
            </ProtectedRoute>
          } />
        </Routes>
      </Suspense>
    </PermissionProvider>
  );
};

export default AppRoutes;
