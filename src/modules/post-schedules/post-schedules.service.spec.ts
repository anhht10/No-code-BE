import { Test, TestingModule } from '@nestjs/testing';
import { PostSchedulesService } from './post-schedules.service';

describe('PostSchedulesService', () => {
  let service: PostSchedulesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostSchedulesService],
    }).compile();

    service = module.get<PostSchedulesService>(PostSchedulesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
