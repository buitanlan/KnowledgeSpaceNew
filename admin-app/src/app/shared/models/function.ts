export interface Function {
  id: string;
  name: string;
  url: string;
  sortOrder: number;
  parentId: string;
  icon: string;
  children: Function[] | null | undefined;
}
