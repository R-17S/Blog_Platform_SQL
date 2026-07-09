//базовый класс view модели для запросов за списком с пагинацией
export class PaginatedViewDto<T> {
  items: T;
  totalCount: number;
  pagesCount: number;
  page: number;
  pageSize: number;

  //статический метод-утилита для мапинга
  public static mapToView<T>(data: {
    items: T;
    page: number;
    pageSize: number;
    totalCount: number;
  }): PaginatedViewDto<T> {
    return {
      pagesCount: Math.ceil(data.totalCount / data.pageSize),
      page: data.page,
      pageSize: data.pageSize,
      totalCount: data.totalCount,
      items: data.items,
    };
  }
}
