import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { CreateTrackingDto } from './dto/tracking.dto';
import { TrackingService } from './tracking.service';

@ApiTags('Tracking')
@Controller('tracking')
export class TrackingController {
    constructor(private readonly trackingService: TrackingService) { }

    @Post()
    @ResponseMessage('Thông tin đã được lưu vào database')
    @ApiOperation({ summary: 'Store tracking event into user_logs' })
    @ApiBody({ type: CreateTrackingDto })
    async createTracking(@Body() payload: CreateTrackingDto) {
        await this.trackingService.createTracking(payload);

        return { message: 'Thông tin đã được lưu vào database' };
    }
}