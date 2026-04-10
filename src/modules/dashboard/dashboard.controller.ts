import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@Controller('admin/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Public()
  @Get('overview')
  @ResponseMessage('Lấy thống kê dashboard admin thành công')
  @ApiOperation({ summary: 'Get overview statistics for admin dashboard' })
  async getOverview() {
    return this.dashboardService.getOverviewStats();
  }

  @Public()
  @Get('insights')
  @ResponseMessage('Lấy dữ liệu biểu đồ dashboard admin thành công')
  @ApiOperation({ summary: 'Get dashboard trends and recent activities' })
  async getInsights(
    @Query('months') months?: string,
    @Query('limit') limit?: string,
  ) {
    const parsedMonths = Number(months);
    const parsedLimit = Number(limit);

    return this.dashboardService.getInsights({
      months: Number.isFinite(parsedMonths) ? parsedMonths : undefined,
      limit: Number.isFinite(parsedLimit) ? parsedLimit : undefined,
    });
  }
}
