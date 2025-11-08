/**
 * CategoryType Enum (Kategori Tipi Sabit Değerler Listesi)
 * 
 * Bu enum, kategori tiplerini tanımlar.
 * 
 * Enum Nedir?
 * Enum, bir değişkenin alabileceği sabit değerleri tanımlar.
 * Bu sayede kategori tipleri tutarlı olur ve yazım hataları önlenir.
 * 
 * Kategori Tipleri:
 * - INCOME: Gelir kategorisi
 * - EXPENSE: Gider kategorisi
 */
export enum CategoryType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

/**
 * DefaultCategory Interface (Varsayılan Kategori Arayüzü)
 * 
 * Bu interface, varsayılan kategorilerin yapısını tanımlar.
 */
export interface DefaultCategory {
  nameKey: string; // i18next translation key (örn: "category.name.salary")
  type: CategoryType;
  icon: string;
  color: string;
  sortOrder: number;
}

/**
 * DefaultCategories Constant (Varsayılan Kategoriler Sabit Değerleri)
 * 
 * Bu sabit değer, yeni kullanıcı kaydolduğunda oluşturulacak varsayılan kategorileri içerir.
 * 
 * nameKey Nedir?
 * nameKey, i18next ile çeviri yapmak için kullanılan bir anahtardır.
 * Frontend'de bu anahtar kullanılarak kullanıcının diline göre kategori adı gösterilir.
 * 
 * Örnek:
 * - nameKey: "category.name.salary" → Frontend'de: "Maaş" (TR), "Salary" (EN)
 * 
 * Translation Key Formatı:
 * category.name.{category_key}
 * 
 * Örnek Translation Keys:
 * - category.name.salary → "Maaş"
 * - category.name.investment → "Yatırım"
 * - category.name.food → "Yemek"
 * - category.name.transportation → "Ulaşım"
 */
export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  // Income kategorileri
  {
    nameKey: 'salary',
    type: CategoryType.INCOME,
    icon: '💰',
    color: '#00C853',
    sortOrder: 1,
  },
  {
    nameKey: 'investment',
    type: CategoryType.INCOME,
    icon: '📈',
    color: '#00E676',
    sortOrder: 2,
  },
  {
    nameKey: 'other_income',
    type: CategoryType.INCOME,
    icon: '💵',
    color: '#69F0AE',
    sortOrder: 3,
  },
  // Expense kategorileri
  {
    nameKey: 'food',
    type: CategoryType.EXPENSE,
    icon: '🍔',
    color: '#FF5722',
    sortOrder: 1,
  },
  {
    nameKey: 'transportation',
    type: CategoryType.EXPENSE,
    icon: '🚗',
    color: '#FF9800',
    sortOrder: 2,
  },
  {
    nameKey: 'bills',
    type: CategoryType.EXPENSE,
    icon: '💡',
    color: '#FFC107',
    sortOrder: 3,
  },
  {
    nameKey: 'entertainment',
    type: CategoryType.EXPENSE,
    icon: '🎬',
    color: '#9C27B0',
    sortOrder: 4,
  },
  {
    nameKey: 'health',
    type: CategoryType.EXPENSE,
    icon: '🏥',
    color: '#F44336',
    sortOrder: 5,
  },
  {
    nameKey: 'other_expense',
    type: CategoryType.EXPENSE,
    icon: '📦',
    color: '#607D8B',
    sortOrder: 6,
  },
];

