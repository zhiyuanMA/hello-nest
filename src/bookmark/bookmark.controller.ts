import {
  Body,
  Controller,
  Get,
  ParseArrayPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateBookmarkDto } from './dto';
import { JwtGuard } from '../auth/guard';

@UseGuards(JwtGuard)
@Controller('bookmarks')
export class BookmarkController {
  @Get()
  findByIds(
    @Query('ids', new ParseArrayPipe({ items: Number, separator: ',' }))
    ids: number[],
  ) {
    return 'This action returns bookmarks by ids';
  }

  @Post()
  createBulk(
    @Body(new ParseArrayPipe({ items: CreateBookmarkDto }))
    createUserDtos: CreateBookmarkDto[],
  ) {
    return 'This action adds new bookmarks';
  }
}
