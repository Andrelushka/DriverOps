import { Test, TestingModule } from '@nestjs/testing';

import { HealthController } from './health.controller.js';

describe('HealthController', () => {
    let controller: HealthController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [HealthController],
        }).compile();

        controller = module.get<HealthController>(HealthController);
    });
    describe('getHealth', () => {
        it('should report that the API is healthy', () => {
            expect(controller.getHealth()).toEqual({ status: 'ok' });
        });
    });
});