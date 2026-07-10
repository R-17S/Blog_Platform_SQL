export type PostSqlEntity = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;

  blogId: string;

  likesCount: number;
  dislikesCount: number;

  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

