import { Test, TestingModule } from '@nestjs/testing';
import { PostSchedulesController } from './post-schedules.controller';
import { PostSchedulesService } from './post-schedules.service';

describe('PostSchedulesController', () => {
  let controller: PostSchedulesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostSchedulesController],
      providers: [PostSchedulesService],
    }).compile();

    controller = module.get<PostSchedulesController>(PostSchedulesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
