import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBookmarkDto } from './dto';
import { EditBookmarkDto } from './dto/edit-bookmark.dto';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}
  getBookmarks(userId: number) {
    const bookmarks = this.prisma.bookmark.findMany({
      where: {
        userId: userId,
      },
    });
    return bookmarks;
  }

  getBookMarkById(userId: number, bookmarkId: number) {
    const bookmark = this.prisma.bookmark.findUnique({
      where: {
        userId: userId,
        id: bookmarkId,
      },
    });
    return bookmark;
  }

  async createBookmark(userId: number, dto: CreateBookmarkDto) {
    const bookmark = this.prisma.bookmark.create({
      data: {
        userId,
        ...dto,
      },
    });
    return bookmark;
  }

  async editBookmarkById(
    userId: number,
    bookmarkId: number,
    dto: EditBookmarkDto,
  ) {
    // get the bookmark by id
    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        id: bookmarkId,
      },
    });

    //check if the bookmark exists and it is owned by user
    if (!bookmark || bookmark.userId !== userId) {
      throw new ForbiddenException('Access to resource denied');
    }

    return this.prisma.bookmark.update({
      where: {
        id: bookmarkId,
      },
      data: {
        ...dto,
      },
    });
  }

  async deleteBookmarkById(userId: number, bookmarkId: number) {
    // get the bookmark by id
    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        id: bookmarkId,
      },
    });

    //check if the bookmark exists and it is owned by user
    if (!bookmark || bookmark.userId !== userId) {
      throw new ForbiddenException('Access to resource denied');
    }

    return this.prisma.bookmark.delete({
      where: {
        id: bookmarkId,
      },
    });
  }
}
