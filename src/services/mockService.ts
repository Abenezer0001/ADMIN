import { Item, Order, User, Invoice, InventoryItem } from '../types/models';

// Mock Item Service
export const mockItemService = {
  getItems: async (): Promise<Item[]> => {
    return [
      { id: '1', name: 'Regular Hot Tea', price: 2.50, category: 'Beverages' },
      { id: '2', name: 'Regular Water 500ml', price: 1.00, category: 'Beverages' },
      { id: '3', name: 'Regular Salt Popcorn', price: 4.50, category: 'Snacks' },
    ];
  },
};

// Mock data
let items = [
  {
    id: 1,
    name: 'Classic Burger',
    description: 'Juicy beef patty with fresh lettuce, tomatoes, and special sauce',
    price: 12.99,
    category: 'Burgers',
    available: true
  },
  {
    id: 2,
    name: 'Margherita Pizza',
    description: 'Fresh mozzarella, tomatoes, and basil on our house-made dough',
    price: 15.99,
    category: 'Pizza',
    available: true
  },
  {
    id: 3,
    name: 'Caesar Salad',
    description: 'Crisp romaine lettuce, parmesan cheese, croutons, and caesar dressing',
    price: 9.99,
    category: 'Salads',
    available: true
  }
];

// Mock item service
export const mockItemCRUDService = {
  getItems: async () => {
    return Promise.resolve([...items]);
  },

  getItem: async (id: number) => {
    const item = items.find(item => item.id === id);
    if (!item) throw new Error('Item not found');
    return Promise.resolve({ ...item });
  },

  createItem: async (itemData: Partial<typeof items[0]>) => {
    const newId = Math.max(...items.map(item => item.id)) + 1;
    const newItem = {
      id: newId,
      name: itemData.name || '',
      description: itemData.description || '',
      price: itemData.price || 0,
      category: itemData.category || '',
      available: itemData.available !== undefined ? itemData.available : true
    };
    items.push(newItem);
    return Promise.resolve({ ...newItem });
  },

  updateItem: async (id: number, itemData: Partial<typeof items[0]>) => {
    const index = items.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Item not found');
    
    items[index] = {
      ...items[index],
      ...itemData
    };
    return Promise.resolve({ ...items[index] });
  },

  deleteItem: async (id: number) => {
    const index = items.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Item not found');
    
    items = items.filter(item => item.id !== id);
    return Promise.resolve(true);
  }
};

// Mock Order Service
export const mockOrderService = {
  getOrders: async (): Promise<Order[]> => {
    return [
      { id: '1', items: ['1', '2'], total: 3.50, status: 'completed', timestamp: new Date().toISOString() },
      { id: '2', items: ['3'], total: 4.50, status: 'pending', timestamp: new Date().toISOString() },
    ];
  },
};

// Mock User Service
export const mockUserService = {
  getUsers: async (): Promise<User[]> => {
    return [
      { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'staff' },
    ];
  },
};

// Mock Inventory Service
export const mockInventoryService = {
  getInventory: async (): Promise<InventoryItem[]> => {
    return [
      { id: '1', name: 'Tea Bags', quantity: 500, unit: 'pcs', reorderPoint: 100 },
      { id: '2', name: 'Water Bottles', quantity: 1000, unit: 'pcs', reorderPoint: 200 },
      { id: '3', name: 'Popcorn Kernels', quantity: 50, unit: 'kg', reorderPoint: 10 },
    ];
  },
  updateInventory: async (id: string, quantity: number): Promise<InventoryItem> => {
    return { id, name: 'Updated Item', quantity, unit: 'pcs', reorderPoint: 100 };
  },
  deleteInventoryItem: async (id: string): Promise<void> => {
    // Mock deletion
  },
  addInventoryItem: async (item: Omit<InventoryItem, 'id'>): Promise<InventoryItem> => {
    return { ...item, id: Math.random().toString() };
  },
};

// Mock Invoice Service
export const mockInvoiceService = {
  getInvoices: async (): Promise<Invoice[]> => {
    return [
      { 
        id: '1', 
        orderIds: ['1'], 
        total: 3.50, 
        status: 'paid', 
        date: new Date().toISOString(),
        customerName: 'John Doe'
      },
      { 
        id: '2', 
        orderIds: ['2'], 
        total: 4.50, 
        status: 'pending', 
        date: new Date().toISOString(),
        customerName: 'Jane Smith'
      },
    ];
  },
  updateInvoice: async (id: string, status: string): Promise<Invoice> => {
    return { 
      id, 
      orderIds: ['1'], 
      total: 3.50, 
      status, 
      date: new Date().toISOString(),
      customerName: 'John Doe'
    };
  },
  deleteInvoice: async (id: string): Promise<void> => {
    // Mock deletion
  },
  addInvoice: async (invoice: Omit<Invoice, 'id'>): Promise<Invoice> => {
    return { ...invoice, id: Math.random().toString() };
  },
};

// Mock menu items data
let menuItems = [
  {
    id: '1',
    mainItemName: 'Popcorn Grand Salt',
    arabicName: 'فشار بالملح كبير',
    preparation: 10,
    description: 'Large Salt Popcorn',
    arabicDescription: 'فشار بالملح كبير',
    sku: '3327',
    barcode: '',
    price: 26.00,
    currency: 'QAR',
    ingredients: ['Popcorn', 'Salt', 'Oil'],
    modifierGroups: [{ 
      id: '1',
      name: 'Add-ons',
      arabicName: 'إضافات',
      description: '',
      arabicDescription: '',
      minSelect: 0,
      maxSelect: 3,
      isRequired: false,
      modifiers: []
    }],
    classifications: ['Snacks', 'Popcorn'],
    allergens: ['None'],
    nutritionalInfo: {
      calories: 300,
      protein: 3,
      carbs: 30,
      fat: 15
    },
    instructions: [],
    tags: ['Popcorn'],
    image: '/images/popcorn-salt.jpg',
    isAvailable: true,
    eightySixReason: '',
    menuId: 'novo-cinema-vendome',
    branchId: 'vendome-mall-lusail',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    mainItemName: 'Popcorn Grand Flavored',
    arabicName: 'فشار بالنكهات كبير',
    preparation: 10,
    description: 'Large Flavored Popcorn',
    arabicDescription: 'فشار بالنكهات كبير',
    sku: '3328',
    barcode: '',
    price: 28.00,
    currency: 'QAR',
    ingredients: ['Popcorn', 'Flavoring', 'Oil'],
    modifierGroups: [{
      id: '2',
      name: 'Your Choice Of Flavor',
      arabicName: 'اختيارك من النكهات',
      description: '',
      arabicDescription: '',
      minSelect: 1,
      maxSelect: 1,
      isRequired: true,
      modifiers: [
        {
          id: '1',
          name: 'Caramel',
          arabicName: 'كراميل',
          price: 0,
          isAvailable: true
        },
        {
          id: '2',
          name: 'Cheese',
          arabicName: 'جبنة',
          price: 0,
          isAvailable: true
        }
      ]
    }],
    classifications: ['Snacks', 'Popcorn'],
    allergens: ['Dairy'],
    nutritionalInfo: {
      calories: 350,
      protein: 3,
      carbs: 35,
      fat: 18
    },
    instructions: [],
    tags: ['Popcorn', 'Flavored'],
    image: '/images/popcorn-flavored.jpg',
    isAvailable: true,
    eightySixReason: '',
    menuId: 'novo-cinema-vendome',
    branchId: 'vendome-mall-lusail',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Mock modifier groups data
let modifierGroups = [
  {
    id: '1',
    name: 'Add-ons',
    arabicName: 'إضافات',
    description: 'Optional add-ons for your item',
    arabicDescription: 'إضافات اختيارية للعنصر الخاص بك',
    minSelect: 0,
    maxSelect: 3,
    isRequired: false,
    modifiers: [
      {
        id: '1',
        name: 'Extra Cheese',
        arabicName: 'جبنة إضافية',
        price: 5,
        isAvailable: true,
      },
      {
        id: '2',
        name: 'Extra Sauce',
        arabicName: 'صلصة إضافية',
        price: 3,
        isAvailable: true,
      },
    ],
  },
  {
    id: '2',
    name: 'Choose Your Flavor',
    arabicName: 'اختر النكهة',
    description: 'Select your preferred flavor',
    arabicDescription: 'اختر النكهة المفضلة لديك',
    minSelect: 1,
    maxSelect: 1,
    isRequired: true,
    modifiers: [
      {
        id: '3',
        name: 'Caramel',
        arabicName: 'كراميل',
        price: 0,
        isAvailable: true,
      },
      {
        id: '4',
        name: 'Cheese',
        arabicName: 'جبنة',
        price: 0,
        isAvailable: true,
      },
    ],
  },
];

// Mock menu item service
export const mockMenuItemService = {
  getMenuItems: async () => {
    return Promise.resolve([...menuItems]);
  },

  getMenuItem: async (id: string) => {
    const item = menuItems.find(item => item.id === id);
    if (!item) throw new Error('Menu item not found');
    return Promise.resolve({ ...item });
  },

  createMenuItem: async (itemData: any) => {
    const newId = (menuItems.length + 1).toString();
    const newItem = {
      id: newId,
      ...itemData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      menuId: 'novo-cinema-vendome',
      branchId: 'vendome-mall-lusail'
    };
    menuItems.push(newItem);
    return Promise.resolve({ ...newItem });
  },

  updateMenuItem: async (id: string, itemData: any) => {
    const index = menuItems.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Menu item not found');
    
    menuItems[index] = {
      ...menuItems[index],
      ...itemData,
      updatedAt: new Date().toISOString()
    };
    return Promise.resolve({ ...menuItems[index] });
  },

  deleteMenuItem: async (id: string) => {
    const index = menuItems.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Menu item not found');
    
    menuItems = menuItems.filter(item => item.id !== id);
    return Promise.resolve(true);
  },

  // Modifier Group Methods
  getModifierGroups: async () => {
    return Promise.resolve([...modifierGroups]);
  },

  getModifierGroup: async (id: string) => {
    const group = modifierGroups.find(group => group.id === id);
    if (!group) throw new Error('Modifier group not found');
    return Promise.resolve({ ...group });
  },

  createModifierGroup: async (groupData: any) => {
    const newId = (modifierGroups.length + 1).toString();
    const newGroup = {
      id: newId,
      ...groupData,
      modifiers: groupData.modifiers.map((modifier: any, index: number) => ({
        ...modifier,
        id: `${newId}-${index + 1}`,
      })),
    };
    modifierGroups.push(newGroup);
    return Promise.resolve({ ...newGroup });
  },

  updateModifierGroup: async (id: string, groupData: any) => {
    const index = modifierGroups.findIndex(group => group.id === id);
    if (index === -1) throw new Error('Modifier group not found');
    
    modifierGroups[index] = {
      ...modifierGroups[index],
      ...groupData,
      id, // Preserve the original ID
    };
    return Promise.resolve({ ...modifierGroups[index] });
  },

  deleteModifierGroup: async (id: string) => {
    const index = modifierGroups.findIndex(group => group.id === id);
    if (index === -1) throw new Error('Modifier group not found');
    
    modifierGroups = modifierGroups.filter(group => group.id !== id);
    return Promise.resolve(true);
  },
};
