'use strict';

const { FoodCategory } = require('../models');



// Las categorías deben coincidir exactamente con el seeder
const CATEGORY_NAMES = [
  'General',
  'Fruits',
  'Vegetables',
  'Grains and Legumes',
  'Meat and Poultry',
  'Fish and Seafood',
  'Dairy and Eggs',
  'Beverages',
  'Snacks and Sweets',
  'Custom',
  'Restaurant / Processed',
];

const DEFAULT_CATEGORY_NAME = CATEGORY_NAMES[0];

// Palabras clave asociadas a cada categoría
const CATEGORY_KEYWORDS = {
  'Restaurant / Processed': ['mcdonald', 'starbucks', 'kellogg', 'lay', 'kraft', 'nestle', 'coca-cola', 'pepsi', 'subway', 'pizza hut', 'burger king'],
  'Fruits': ['apple', 'banana', 'orange', 'strawberry', 'grape', 'peach', 'mango', 'pineapple', 'fruit'],
  'Vegetables': ['carrot', 'broccoli', 'spinach', 'potato', 'tomato', 'cucumber', 'lettuce', 'onion', 'vegetable'],
  'Grains and Legumes': ['bean', 'rice', 'lentil', 'oat', 'bread', 'pasta', 'cereal', 'flour', 'quinoa', 'corn'],
  'Meat and Poultry': ['beef', 'chicken', 'pork', 'turkey', 'lamb', 'steak', 'sausage'],
  'Fish and Seafood': ['salmon', 'tuna', 'shrimp', 'cod', 'fish', 'crab', 'lobster'],
  'Dairy and Eggs': ['milk', 'cheese', 'yogurt', 'butter', 'egg'],
  'Beverages': ['juice', 'water', 'soda', 'tea', 'coffee', 'drink'],
  'Snacks and Sweets': ['chips', 'cookie', 'cake', 'candy', 'chocolate', 'cracker', 'popcorn'],
  // 'Custom' y 'General' no tienen keywords
};

const categoryMap = {};

module.exports.loadCategories = async function loadCategories() {
  const categories = await FoodCategory.findAll();
  categories.forEach(cat => {
    if (CATEGORY_NAMES.includes(cat.name)) {
      categoryMap[cat.name] = cat.id;
    }
  });
  return categoryMap;
}

exports.getCategoryIdByDescription = (description) => {
  if (Object.keys(categoryMap).length === 0) {
    throw new Error('Category map is empty. Please load categories first.');
  }
  const categoryDefaultId = categoryMap[DEFAULT_CATEGORY_NAME];
  if (!description) return categoryDefaultId;
  const lowerCaseDescription = description.toLowerCase();

  // Prioridad: Restaurant / Processed
  for (const keyword of CATEGORY_KEYWORDS['Restaurant / Processed'] || []) {
    if (lowerCaseDescription.includes(keyword)) {
      return categoryMap['Restaurant / Processed'];
    }
  }
  // Resto de categorías con keywords
  for (const name of CATEGORY_NAMES) {
    if (!CATEGORY_KEYWORDS?.[name]) continue;
    for (const keyword of CATEGORY_KEYWORDS?.[name] || []) {
      if (lowerCaseDescription.includes(keyword)) {
        return categoryMap[name];
      }
    }
  }
  // Si no coincide, General
  return categoryDefaultId;
};

module.exports.loadCategories = async function loadCategories() {
  const categories = await FoodCategory.findAll();
  categories.forEach(element => {
    categoryMap[element.name] = element.id;
  });
  return categoryMap;
}

exports.getCategoryIdByDescription = (description) => {
  if (Object.keys(categoryMap).length === 0) {
    throw new Error('Category map is empty. Please load categories first.');
  }
  const categoryDefaultId = categoryMap[DEFAULT_CATEGORY_NAME];
  if (!description) return categoryDefaultId;
  const lowerCaseDescription = description.toLowerCase();
  for (const [name, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(keyword => lowerCaseDescription.includes(keyword))) {
      return categoryMap[name];
    }
  }
  return categoryDefaultId;
};
