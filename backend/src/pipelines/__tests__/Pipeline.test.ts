import { Pipeline, PipelineStep } from '../Pipeline';

describe('Pipeline', () => {
    let pipeline: Pipeline<string>;

    beforeEach(() => {
        pipeline = new Pipeline({ name: 'TestPipeline' });
    });

    it('should successfully add steps to the pipeline', () => {
        const step: PipelineStep<string> = {
            process: async (input: string) => input + '_processed'
        };

        pipeline.addStep(step);
        expect(pipeline.getStepCount()).toBe(1);
    });

    it('should process data through all steps successfully', async () => {
        const step1: PipelineStep<string> = {
            process: async (input: string) => input + '_step1'
        };
        const step2: PipelineStep<string> = {
            process: async (input: string) => input + '_step2'
        };

        pipeline.addStep(step1).addStep(step2);
        const result = await pipeline.process('initial');
        expect(result).toBe('initial_step1_step2');
    });

    it('should initialize pipeline with initial steps', () => {
        const initialSteps: PipelineStep<string>[] = [
            {
                process: async (input: string) => input + '_initial'
            }
        ];

        const pipelineWithInitialSteps = new Pipeline({ name: 'TestPipeline' }, initialSteps);
        expect(pipelineWithInitialSteps.getStepCount()).toBe(1);
    });

    it('should reset pipeline successfully', () => {
        const step: PipelineStep<string> = {
            process: async (input: string) => input + '_processed'
        };

        pipeline.addStep(step);
        expect(pipeline.getStepCount()).toBe(1);
        
        pipeline.reset();
        expect(pipeline.getStepCount()).toBe(0);
    });
});
