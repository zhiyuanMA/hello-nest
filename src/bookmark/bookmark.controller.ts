import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  ParseArrayPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import { BookmarkService } from './bookmark.service';

@UseGuards(JwtGuard)
@Controller('bookmarks')
export class BookmarkController {
  private readonly logger = new Logger(BookmarkController.name);

  constructor(private bookmarkService: BookmarkService) {}

  @Get()
  getBookmarks(@GetUser('id') userId: number) {
    this.logger.debug(`Get bookmarks with user id: ${userId}`);
    return this.bookmarkService.getBookmarks(userId);
  }

  @Get(':id')
  getBookmarksById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) bookmarkId: number,
  ) {
    this.logger.debug(
      `Get bookmarks with user id: ${userId}, and bookmark id: ${bookmarkId}`,
    );
    return this.bookmarkService.getBookmarkById(userId, bookmarkId);
  }

  @Get()
  findByIds(
    @Query('ids', new ParseArrayPipe({ items: Number, separator: ',' }))
    ids: number[],
  ) {
    return 'This action returns bookmarks by ids';
  }

  @Post()
  createBookmark(
    @GetUser('id') userId: number,
    @Body() dto: CreateBookmarkDto,
  ) {
    this.logger.debug(
      `Create bookmark for user ${userId} with ${JSON.stringify(dto)}`,
    );
    return this.bookmarkService.createBookmark(userId, dto);
  }

  @Post()
  createBulk(
    @Body(new ParseArrayPipe({ items: CreateBookmarkDto }))
    createUserDtos: CreateBookmarkDto[],
  ) {
    return 'This action adds new bookmarks';
  }

  @Patch(':id')
  editBookmarkById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) bookmarkId: number,
    @Body() dto: EditBookmarkDto,
  ) {
    this.logger.debug(
      `Edit bookmark ${bookmarkId} for user ${userId} with ${JSON.stringify(
        dto,
      )}`,
    );
    return this.bookmarkService.editBookmarkById(userId, bookmarkId, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deleteBookmarkById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) bookmarkId: number,
  ) {
    this.logger.debug(`Delete bookmark ${bookmarkId} for user ${userId}`);
    return this.bookmarkService.deleteBookmarkById(userId, bookmarkId);
  }
}
