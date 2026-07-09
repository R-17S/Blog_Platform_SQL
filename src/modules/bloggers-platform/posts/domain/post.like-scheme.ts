export type PostLikeSqlEntity = {
  userId: string;
  postId: string;
  status: string; // LikeStatusTypes
  createdAt: string;
};
