export const TICKET_LIST_COLUMNS = [
  'id',
  'title',
  'status',
  'priority',
  'category',
  'requester',
  'assignee',
  'createdDate',
] as const;

export const TICKET_LIST_PAGE_SIZE = 10;
export const TICKET_LIST_PAGE_SIZE_OPTIONS = [10, 25, 50];
export const TICKET_LIST_DEFAULT_SORT = 'createdDate,desc';
export const TICKET_LIST_TEXT_MAX_LENGTH = 100;
