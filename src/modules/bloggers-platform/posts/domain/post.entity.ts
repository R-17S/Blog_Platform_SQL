export type PostSqlEntity = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;

  blogId: string;
  blogName: string;

  likesCount: number;
  dislikesCount: number;

  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

//   static createInstance(
//     title: string,
//     shortDescription: string,
//     content: string,
//     blogId: string,
//     blogName: string,
//   ): PostDocument {
//     const post = new this();
//     post.title = title;
//     post.shortDescription = shortDescription;
//     post.content = content;
//     post.blogId = blogId;
//     post.blogName = blogName;
//     post.likesCount = 0;
//     post.dislikesCount = 0;
//     return post as PostDocument;
//   }
//
//   updateDetails(title: string, shortDescription: string, content: string) {
//     this.title = title;
//     this.shortDescription = shortDescription;
//     this.content = content;
//   }
//
//   makeDeleted() {
//     if (this.deletedAt !== null) {
//       this.deletedAt = new Date();
//     }
//   }
// }
//
// export const PostEntity = SchemaFactory.createForClass(Post);
// PostEntity.loadClass(Post);
//
// export type PostDocument = HydratedDocument<Post>;
// export type PostModelType = Model<PostDocument> & typeof Post;
