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
  UseGuards,
} from '@nestjs/common';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import { BookmarkService } from './bookmark.service';
import { RolesGuard } from '../auth/guard/roles.guard';
import { HasRoles } from '../auth/decorator/has-roles.decorator';
import { Role } from '@prisma/client/index';

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

  @Get(':ids')
  getBookmarksByIds(
    @GetUser('id') userId: number,
    @Param('ids', new ParseArrayPipe({ items: Number, separator: ',' }))
    ids: number[],
  ) {
    this.logger.debug(
      `Get bookmarks with user id: ${userId}, and bookmark id: ${ids}`,
    );
    return this.bookmarkService.getBookmarkByIds(userId, ids);
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

  @Post('bulk/:id')
  @HasRoles(Role.ADMIN)
  @UseGuards(RolesGuard)
  createBulk(
    @Param('id') userId: number,
    @Body(new ParseArrayPipe({ items: CreateBookmarkDto }))
    dtos: CreateBookmarkDto[],
  ) {
    this.logger.debug(`Create bulk for user ${userId}`);
    return this.bookmarkService.createBookmarks(userId, dtos);
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
  @HasRoles(Role.ADMIN)
  @UseGuards(RolesGuard)
  deleteBookmarkById(@Param('id', ParseIntPipe) bookmarkId: number) {
    this.logger.debug(`Delete bookmark ${bookmarkId}`);
    return this.bookmarkService.deleteBookmarkById(bookmarkId);
  }
}
