import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IndustryService } from './industry.service';

@ApiTags('Industries')
@Controller()
export class IndustryController {
  constructor(private readonly industry: IndustryService) {}

  @Get('industries')
  @ApiOperation({ summary: 'Get industries list ' })
  getCourses() {
    return this.industry.getIndustries();
  }
}
