import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class Pagination {
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  page: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  count: number;

  @IsOptional()
  @IsString()
  orderBy?: string;

  @IsOptional()
  @IsBoolean()
  asc?: boolean;
}
