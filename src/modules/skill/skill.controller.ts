import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { SkillService } from './skill.service';

@ApiTags('Skills')
@Public()
@Controller()
export class SkillController {
  constructor(private readonly skillService: SkillService) {}

  @Post('skills')
  @ApiOperation({ summary: 'Create a skill' })
  createSkill(@Body() payload: CreateSkillDto) {
    return this.skillService.createSkill(payload);
  }

  @Get('skills')
  @ApiOperation({ summary: 'Get skills list' })
  getSkills() {
    return this.skillService.getSkills();
  }

  @Get('skills/:id')
  @ApiOperation({ summary: 'Get skill detail by id' })
  getSkillById(@Param('id') id: string) {
    return this.skillService.getSkillById(id);
  }

  @Patch('skills/:id')
  @ApiOperation({ summary: 'Update a skill' })
  updateSkill(@Param('id') id: string, @Body() payload: UpdateSkillDto) {
    return this.skillService.updateSkill(id, payload);
  }

  @Delete('skills/:id')
  @ApiOperation({ summary: 'Delete a skill' })
  deleteSkill(@Param('id') id: string) {
    return this.skillService.deleteSkill(id);
  }
}
