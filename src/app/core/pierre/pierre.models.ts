/** Resposta `GET .../tools/api/get-balance` (Pierre). */
export interface PierreContaBalance {
  id?: string;
  name: string;
  balance: number | string;
  account_type: string;
  account_subtype: string;
}

export interface PierreGetBalanceResponse {
  success: boolean;
  data?: {
    total_balance: number;
    accounts: PierreContaBalance[];
  };
  timestamp?: string;
}

/** Item de `GET .../tools/api/get-transactions?format=raw&startDate=&endDate=`. */
export interface PierreTransacao {
  id: string;
  description?: string;
  category?: string;
  original_category?: string;
  currency_code: string;
  amount: number | string;
  balance: number | string;
  date: string;
  type: string;
  status: string;
  account_name: string;
  account_type: string;
  account_subtype: string;
  account_marketing_name?: string;
}

export interface PierreGetTransactionsResponse {
  success: boolean;
  data?: PierreTransacao[];
  count?: number;
  timestamp?: string;
}

export type PierrePaymentReminderFilter = 'active' | 'all' | 'upcoming' | 'overdue';

export interface PierrePaymentReminder {
  id?: string;
  title: string;
  amount?: number | string;
  dueDate: string;
  reminderTime?: string;
  status?: string;
  isRecurring?: boolean;
  recurrencePattern?: string | null;
}

export interface PierreListPaymentRemindersResponse {
  success: boolean;
  data?: PierrePaymentReminder[];
  count?: number;
  timestamp?: string;
}

export type PierreAccountType = 'BANK' | 'CREDIT' | 'INVESTMENT' | 'LOAN';

export interface PierreAccount {
  accountId?: string;
  id?: string;
  accountName?: string;
  name?: string;
  accountType?: PierreAccountType | string;
  accountSubtype?: string;
  balance?: number | string;
}

export interface PierreGetAccountsResponse {
  success: boolean;
  data?: PierreAccount[];
  timestamp?: string;
}
