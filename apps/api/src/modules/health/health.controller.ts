import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/public.decorator.js';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @Public()
  @ApiOperation({ summary: 'Check API health' })
  @ApiOkResponse({
    description: 'The API is running',
    schema: {
      example: {
        status: 'ok',
      },
    },
  })
  getHealth(): { status: string } {
    return { status: 'ok' };
  }
}
