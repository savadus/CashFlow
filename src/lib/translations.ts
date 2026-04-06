export type Language = 'en' | 'ml' | 'hi';

export const translations = {
  en: {
    // Header
    LEDGER: 'Financial Ledger',
    HI: 'Hi',
    ACCOUNT: 'Account',
    // Balance Overview
    NET_BALANCE: 'Net Balance',
    // Insights
    INCOME: 'Income',
    EXPENSE: 'Expense',
    CASH_POSITION: 'Cash Position',
    // Accounts
    ACCOUNTS: 'Accounts',
    CLEAR_FILTER: 'Clear Filter',
    // Transaction List
    RECENT_TRANSACTIONS: 'Recent Transactions',
    NO_TRANSACTIONS: 'No Transactions Found',
    // Navigation
    OUT: 'Out',
    IN: 'In',
    MORE: 'More',
    // More Menu
    BUSINESS_SUITE: 'Business Suite',
    SYSTEM_SETTINGS: 'System Settings',
    LANGUAGE: 'Language',
    LOGOUT: 'Terminate Session',
    ABOUT_PLATFORM: 'About Platform',
    VERSION: 'Industrial Series',
    // Modals
    ADD_TRANSACTION: 'Add Transaction',
    AMOUNT: 'Amount (₹)',
    NOTE: 'Add Note (optional)',
    SAVE: 'Save Transaction',
    UPDATE: 'Update Transaction',
    DELETE: 'Delete',
    // More
    LOANS: 'Loans',
    BILLS: 'Invoices',
    // Purpose
    PERSONAL: 'Personal',
    BUSINESS: 'Business',
    STUDENT: 'Student',
  },
  ml: {
    // Header
    LEDGER: 'സാമ്പത്തിക ലഡ്ജർ',
    HI: 'ഹലോ',
    ACCOUNT: 'അക്കൗണ്ട്',
    // Balance Overview
    NET_BALANCE: 'മൊത്തം തുക',
    // Insights
    INCOME: 'വരവ്',
    EXPENSE: 'ചെലവ്',
    CASH_POSITION: 'ക്യാഷ് നില',
    // Accounts
    ACCOUNTS: 'അക്കൗണ്ടുകൾ',
    CLEAR_FILTER: 'ഫിൽട്ടർ മാറ്റുക',
    // Transaction List
    RECENT_TRANSACTIONS: 'പുതിയ ഇടപാടുകൾ',
    NO_TRANSACTIONS: 'ഇടപാടുകൾ കാണുന്നില്ല',
    // Navigation
    OUT: 'ചെലവ്',
    IN: 'വരവ്',
    MORE: 'കൂടുതൽ',
    // More Menu
    BUSINESS_SUITE: 'ബിസിനസ് സ്യൂട്ട്',
    SYSTEM_SETTINGS: 'സിസ്റ്റം ക്രമീകരണങ്ങൾ',
    LANGUAGE: 'ഭാഷ',
    LOGOUT: 'ലോഗൗട്ട് ചെയ്യുക',
    ABOUT_PLATFORM: 'പ്ലാറ്റ്‌ഫോമിനെക്കുറിച്ച്',
    VERSION: 'ഇൻഡസ്ട്രിയൽ സീരീസ്',
    // Modals
    ADD_TRANSACTION: 'ഇടപാട് ചേർക്കുക',
    AMOUNT: 'തുക (₹)',
    NOTE: 'വിവരങ്ങൾ (ഓപ്ഷണൽ)',
    SAVE: 'സേവ് ചെയ്യുക',
    UPDATE: 'അപ്ഡേറ്റ് ചെയ്യുക',
    DELETE: 'ഡിലീറ്റ് ചെയ്യുക',
    // More
    LOANS: 'വായ്പകൾ',
    BILLS: 'ബില്ലുകൾ',
    // Purpose
    PERSONAL: 'വ്യക്തിഗതം',
    BUSINESS: 'ബിസിനസ്',
    STUDENT: 'വിദ്യാർത്ഥി',
    // Cash Position
    WHERE_IS_CASH: 'പണം എവിടെയാണ്?',
    IN_HAND: 'കൈവശം',
    IN_BANK: 'ബാങ്കിൽ',
    BANK_BARODA: 'ബറോഡ ബാങ്ക്',
    BANK_SBI: 'എസ്.ബി.ഐ ബാങ്ക്',
    BANK_SIB: 'എസ്.ഐ.ബി ബാങ്ക്',
  },
  hi: {
    // Header
    LEDGER: 'वित्तीय लेजर',
    HI: 'नमस्ते',
    ACCOUNT: 'खाता',
    // Balance Overview
    NET_BALANCE: 'कुल शेष राशि',
    // Insights
    INCOME: 'आय',
    EXPENSE: 'व्यय',
    CASH_POSITION: 'नकद स्थिति',
    // Accounts
    ACCOUNTS: 'खातों',
    CLEAR_FILTER: 'फ़िल्टर हटाएं',
    // Transaction List
    RECENT_TRANSACTIONS: 'हाल के लेनदेन',
    NO_TRANSACTIONS: 'कोई लेनदेन नहीं मिला',
    // Navigation
    OUT: 'बाहर',
    IN: 'अंदर',
    MORE: 'अधिक',
    // More Menu
    BUSINESS_SUITE: 'बिजनेस सूट',
    SYSTEM_SETTINGS: 'सिस्टम सेटिंग्स',
    LANGUAGE: 'भाषा',
    LOGOUT: 'लॉगआउट करें',
    ABOUT_PLATFORM: 'प्लेटफॉर्म के बारे में',
    VERSION: 'औद्योगिक श्रृंखला',
    // Modals
    ADD_TRANSACTION: 'लेनदेन जोड़ें',
    AMOUNT: 'राशि (₹)',
    NOTE: 'नोट जोड़ें (वैकल्पिक)',
    SAVE: 'लेनदेन सहेजें',
    UPDATE: 'लेनदेन अपडेट करें',
    DELETE: 'हटाएं',
    // More
    LOANS: 'ऋण',
    BILLS: 'विधेयक',
    // Purpose
    PERSONAL: 'व्यक्तिगत',
    BUSINESS: 'व्यवसाय',
    STUDENT: 'छात्र',
  }
};

export type TranslationKey = keyof typeof translations.en;
