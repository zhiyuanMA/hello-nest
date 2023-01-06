import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';
import { PaginationResult } from '../util/pagination-result.util';
import { Bookmark } from '@prisma/client/index';

@Injectable()
export class BookmarkService {
  private readonly logger = new Logger(BookmarkService.name);

  constructor(private prisma: PrismaService) {}

  async getBookmarks(
    userId: number,
    page: number,
    count: number,
    orderBy?: string,
    asc?: boolean,
  ): Promise<PaginationResult<Bookmark>> {
    if (!orderBy) {
      orderBy = 'id';
    }
    if (asc === undefined) {
      asc = true;
    }
    const orderByObject = {};
    orderByObject[orderBy] = asc ? 'asc' : 'desc';
    const data = await this.prisma.bookmark.findMany({
      skip: page * count,
      take: count,
      where: {
        userId,
      },
      orderBy: orderByObject,
    });

    return {
      page,
      count,
      orderBy,
      asc,
      data,
    };
  }

  async getBookmarkByIds(userId: number, bookmarkIds: number[]) {
    return await this.prisma.bookmark.findMany({
      where: {
        id: { in: bookmarkIds },
        userId,
      },
    });
  }

  async createBookmarks(userId: number, dtos: CreateBookmarkDto[]) {
    return await this.prisma.bookmark.createMany({
      data: dtos.map((o) => {
        return { userId, ...o };
      }),
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
    const bookmark = await this.getBookmarkByIds(userId, [bookmarkId]);

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

  async deleteBookmarkById(bookmarkId: number) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        id: bookmarkId,
      },
    });

    if (!bookmark) {
      throw new ForbiddenException('Resources not found');
    }

    return await this.prisma.bookmark.delete({ where: { id: bookmarkId } });
  }
}
