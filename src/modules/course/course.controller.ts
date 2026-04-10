import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CourseService } from './course.service';
import { CourseDetailParamsDto, CreateCourseDto } from './dto/course.dto';
import { Public } from '../auth/decorators/public.decorator';


@ApiTags('Courses')
@Controller()
export class CourseController {
  constructor(private readonly courseService: CourseService) {}
  @Public()
  @Get('courses')
  @ApiOperation({
    summary: 'Get course list with lesson count and industry name',
  })
  getCourses() {
    return this.courseService.getCourses();
  }

  @Get('course-detail')
  @ApiOperation({ summary: 'Get course detail by slug' })
  @ApiQuery({ name: 'slug', type: String, example: 'nestjs-fundamentals' })
  getCourseDetail(@Query() params: CourseDetailParamsDto) {
    const { slug } = params;
    return this.courseService.getCourseDetail(slug);
  }

  @Post('/courses')
  @ApiOperation({ summary: 'Create a new course' })
  createCourse(@Body() createCourseDto: CreateCourseDto) {
    return this.courseService.create(createCourseDto);
  }
}
