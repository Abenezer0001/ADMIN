import React from 'react';
const { Suspense, lazy } = React;
import { Routes, Route, Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';

// Import the PasswordSetup component
import PasswordSetup from './pages/PasswordSetup';

// Lazy load components
// Lazy load components
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


const LoadingScreen = () => (
  <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
    <CircularProgress />
  </Box>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Default route */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Authentication Routes */}
        <Route path="/password-setup" element={<PasswordSetup />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/sales" element={<Sales />} />

        {/* Admin Management */}
        <Route path="/settings/admins" element={<AdminManagement />} />

        {/* RBAC Dashboard */}
        <Route path="/settings/rbac" element={<RbacDashboard />} />

        {/* Restaurants */}
        {/* <Route path="/restaurants" element={<RestaurantsPage />} /> */}
        <Route path="/restaurants/add" element={<AddRestaurant />} />
        <Route path="/restaurants/add/:id" element={<AddRestaurant />} />
        <Route path="/restaurants/list" element={<RestaurantList />} />
        <Route path="/restaurants/detail/:id" element={<RestaurantDetail />} />
        {/* Zones */}
        <Route path="/zones/list" element={<ZoneList />} />
        <Route path="/zones/add" element={<ZoneForm />} />
        <Route path="/zones/add/:venueId/:id" element={<ZoneForm />} />
        <Route path="/zones/:id" element={<ZoneSettings />} />
        <Route path="/zones/detail/:id" element={<ZoneDetail />} />

        {/* Tables */}
        <Route path="/tables/list" element={<TableList />} />
        <Route path="/tables/new" element={<TableForm title="Add New Table" />} />
        <Route path="/tables/edit/:id" element={<TableForm title="Edit Table" />} />
        <Route path="/tables/detail/:id" element={<TableDetail />} />
        <Route path="/tables/:id" element={<TableDetail />} />


        {/* Venues */}
        <Route path="/venues/list" element={<VenueList />} />
        <Route path="/venues/add" element={<VenueForm />} />
        <Route path="/venues/add/:id" element={<VenueForm />} />
        <Route path="/venues/detail/:id" element={<VenueDetail />} />
        <Route path="/venues/settings/:id" element={<VenueSettings />} />

        {/* Analytics Routes */}
        <Route path="/analytics/customer-insight" element={<CustomerInsight />} />
        <Route path="/analytics/menu-report" element={<MenuReport />} />
        <Route path="/analytics/order-performance" element={<OrderPerformance />} />

        {/* Live Orders */}
        
        

        {/* Menu Management */}
        <Route path="/items" element={<Items />} />
        <Route path="/modifiers" element={<Modifiers />} />
        <Route path="/menus" element={<MenusByRestaurant />} />
        <Route path="/menu/items" element={<MenuItemsList />} />
        <Route path="/menu/items/new" element={<MenuItems />} />
        <Route path="/menu/items/edit/:id" element={<MenuItems />} /> {/* Changed path for clarity */}
        <Route path="/menu-items/detail/:id" element={<MenuItemDetail />} /> {/* Added detail route */}
        <Route path="/menu/modifiers" element={<ModifierGroups />} />
        <Route path="/menu/modifiers/:id" element={<ModifierGroupEdit />} />
        <Route path="/menu/modifiers/new" element={<ModifierGroupEdit />} />

        {/* Menus */}
        <Route path="/menus/list" element={<MenuList />} />
        <Route path="/menus/add" element={<MenuForm title="Add New Menu" />} />
        <Route path="/menus/edit/:id" element={<MenuForm title="Edit Menu" />} />
        <Route path="/menus/detail/:id" element={<MenuDetail />} />


        {/* Orders */}
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/tables" element={<Tables />} />

        {/* Tables Routes */}
        {/* <Route path="/tables/*" element={<TablesPage />} /> */}

        {/* New Routes */}
        {/* <Route path="/users/manage" element={<UserManagement />} /> */}
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/invoices/:id" element={<InvoicesDetail />} />

        {/* Modifiers */}
        <Route path="/modifiers" element={<ModifierList />} />
        <Route path="/modifiers/add" element={<ModifierForm />} />
        <Route path="/modifiers/edit/:id" element={<ModifierForm />} />
        <Route path="/modifiers/detail/:id" element={<ModifierDetail />} />

        {/* Categories */}
        <Route path="/categories" element={<CategoryList />} />
        <Route path="/categories/add" element={<CategoryForm />} />
        <Route path="/categories/edit/:id" element={<CategoryForm />} />
        <Route path="/categories/detail/:id" element={<CategoryDetail />} />

        {/* SubCategories */}
        <Route path="/subcategories/list" element={<SubCategoryList />} />
        <Route path="/subcategories/add" element={<SubCategoryForm title="Add New Sub-Category" />} />
        <Route path="/subcategories/edit/:id" element={<SubCategoryForm title="Edit Sub-Category" />} />
        <Route path="/subcategories/detail/:id" element={<SubCategoryDetail />} />

        {/* SubSubCategories */}
        <Route path="/subsubcategories/list" element={<SubSubCategoryList />} />
        <Route path="/subsubcategories/add" element={<SubSubCategoryForm />} />
        <Route path="/subsubcategories/edit/:id" element={<SubSubCategoryForm />} />
        <Route path="/subsubcategories/detail/:id" element={<SubSubCategoryDetail />} />

        {/* Settings */}
        <Route path="/settings/preferences" element={<Preferences />} />
        <Route path="/settings/profile" element={<Profile />} />
        <Route path="/settings/change-password" element={<ChangePassword />} />
        <Route path="/settings/sidebar" element={<SidebarSettings />} />

        {/* Setting & Administration */}
        <Route path="/settings/system" element={<SystemSettings />} />
        <Route path="/settings/integration" element={<Integration />} />
        <Route path="/settings/access-control" element={<AccessControl />} />
        <Route path="/settings/loyalty" element={<LoyaltySettings />} />

        {/*  */}
        <Route path="/customers" element={<Customers />} />
        <Route path="/inventory" element={<Inventory />} />
        
        
        
<Route path="/orders/history" element={<OrderHistory />} />
<Route path="/orders/live" element={<LiveOrders />} />
<Route path="/orders/history/:id" element={<OrderDetail/>} />

     
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
