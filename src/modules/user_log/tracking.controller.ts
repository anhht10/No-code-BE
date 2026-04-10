import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { CreateTrackingDto, QueryTrackingDto, TrackingAction, UpdateTrackingDto } from './dto/tracking.dto';
import { TrackingService } from './tracking.service';

@ApiTags('Tracking')
@Controller('tracking')
export class TrackingController {
    constructor(private readonly trackingService: TrackingService) { }

    @Get()
    @ResponseMessage('Lấy danh sách tracking logs thành công')
    @ApiOperation({ summary: 'Get tracking logs with filter and pagination' })
    @ApiQuery({ name: 'action', required: false, enum: TrackingAction })
    @ApiQuery({ name: 'userId', required: false, type: String })
    @ApiQuery({ name: 'courseId', required: false, type: String })
    @ApiQuery({ name: 'fromDate', required: false, type: String, description: 'YYYY-MM-DD or ISO date' })
    @ApiQuery({ name: 'toDate', required: false, type: String, description: 'YYYY-MM-DD or ISO date' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    getTrackings(@Query() query: QueryTrackingDto) {
        return this.trackingService.getTrackingLogs(query);
    }

    @Get(':id')
    @ResponseMessage('Lấy chi tiết tracking log thành công')
    @ApiOperation({ summary: 'Get tracking log detail by id' })
    getTrackingById(@Param('id') id: string) {
        return this.trackingService.getTrackingById(id);
    }

    @Post()
    @ResponseMessage('Thông tin đã được lưu vào database')
    @ApiOperation({ summary: 'Store tracking event into user_logs' })
    @ApiBody({ type: CreateTrackingDto })
    async createTracking(@Body() payload: CreateTrackingDto) {
        await this.trackingService.createTracking(payload);

        return { message: 'Thông tin đã được lưu vào database' };
    }

    @Patch(':id')
    @ResponseMessage('Cập nhật tracking log thành công')
    @ApiOperation({ summary: 'Update tracking log by id' })
    updateTracking(@Param('id') id: string, @Body() payload: UpdateTrackingDto) {
        return this.trackingService.updateTracking(id, payload);
    }

    @Delete(':id')
    @ResponseMessage('Xóa tracking log thành công')
    @ApiOperation({ summary: 'Delete tracking log by id' })
    deleteTracking(@Param('id') id: string) {
        return this.trackingService.deleteTracking(id);
    }
}