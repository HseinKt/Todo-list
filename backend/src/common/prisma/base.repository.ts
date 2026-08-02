import { PrismaService } from './prisma.service';

export abstract class BaseRepository<T> {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly model: string,
  ) {}

  protected get modelDelegate() {
    return (this.prisma as any)[this.model];
  }

  async findMany(params?: {
    skip?: number;
    take?: number;
    cursor?: any;
    where?: any;
    orderBy?: any;
    include?: any;
    select?: any;
  }): Promise<T[]> {
    return this.modelDelegate.findMany(params);
  }

  async findUnique(params: {
    where: any;
    include?: any;
    select?: any;
  }): Promise<T | null> {
    return this.modelDelegate.findUnique(params);
  }

  async findFirst(params?: {
    where?: any;
    include?: any;
    select?: any;
    orderBy?: any;
  }): Promise<T | null> {
    return this.modelDelegate.findFirst(params);
  }

  async create(params: {
    data: any;
    include?: any;
    select?: any;
  }): Promise<T> {
    return this.modelDelegate.create(params);
  }

  async update(params: {
    where: any;
    data: any;
    include?: any;
    select?: any;
  }): Promise<T> {
    return this.modelDelegate.update(params);
  }

  async delete(params: {
    where: any;
    include?: any;
    select?: any;
  }): Promise<T> {
    return this.modelDelegate.delete(params);
  }

  async count(params?: {
    where?: any;
  }): Promise<number> {
    return this.modelDelegate.count(params);
  }
}
