import { IsNotEmpty } from 'class-validator';
import { IsStringWithTrim } from '../../../../core/decorators/validation/is-string-with-trim';

export class UpdatePostByBlogIdDto {
  @IsNotEmpty()
  @IsStringWithTrim(1, 30)
  title: string;

  @IsNotEmpty()
  @IsStringWithTrim(1, 100)
  shortDescription: string;

  @IsNotEmpty()
  @IsStringWithTrim(1, 1000)
  content: string;
}
