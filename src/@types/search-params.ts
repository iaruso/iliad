export type SearchParams = { [key: string]: string | string[] | undefined };

export type PageSearchParamName =
  | "page"
  | "sessionsPage"
  | "notificationsPage"
  | "usersPage"
  | "historyPage";
export type SizeSearchParamName =
  | "size"
  | "sessionsSize"
  | "notificationsSize"
  | "usersSize"
  | "historySize";
