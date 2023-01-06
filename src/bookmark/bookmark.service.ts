import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@Injectable()
export class BookmarkService {
  private readonly logger = new Logger(BookmarkService.name);

  constructor(private prisma: PrismaService) {}

  async getBookmarks(userId: number) {
    return await this.prisma.bookmark.findMany({
      where: {
        userId,
      },
    });
  }

  async getBookmarkById(userId: number, bookmarkId: number) {
    return await this.prisma.bookmark.findFirst({
      where: {
        id: bookmarkId,
        userId,
      },
    });
  }

  async createBookmark(userId: number, dto: CreateBookmarkDto) {
    return await this.prisma.bookmark.create({
      data: {
        userId,
        ...dto,
      },
    });
  }

  async editBookmarkById(
    userId: number,
    bookmarkId: number,
    dto: EditBookmarkDto,
  ) {
    const bookmark = await this.getBookmarkById(userId, bookmarkId);

    if (!bookmark) {
      throw new ForbiddenException('Access to resources denied');
    }

    return await this.prisma.bookmark.update({
      where: {
        id: bookmarkId,
      },
      data: {
        ...dto,
      },
    });
  }

  async deleteBookmarkById(userId: number, bookmarkId: number) {
    const bookmark = await this.getBookmarkById(userId, bookmarkId);

    if (!bookmark) {
      throw new ForbiddenException('Access to resources denied');
    }

    return await this.prisma.bookmark.delete({ where: { id: bookmarkId } });
  }
}
