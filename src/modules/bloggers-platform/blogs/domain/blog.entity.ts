export type BlogSqlEntity = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  isMembership: boolean;

  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};
