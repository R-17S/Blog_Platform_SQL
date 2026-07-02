export type PostLikeSqlEntity = {
  userId: string;
  postId: string;
  userLogin: string;
  status: string; // LikeStatusTypes
  createdAt: string;
};
