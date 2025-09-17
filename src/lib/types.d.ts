export interface Profile {
  name: string;
  role: string;
}

export interface MenuItem {
  title: string;
}

export interface Transactions {
  total: number;
  failed: number;
  successful: number;
  weekly: number[];
}

export interface DashboardData {
  profile: Profile;
  menu: MenuItem[];
  transactions: Transactions;
}