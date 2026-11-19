import { FLOW_STEPS, findStepByPath } from './flow';

describe('flow', () => {
  it('has the seven sections of the design', () => {
    expect(FLOW_STEPS).toHaveLength(7);
    expect(new Set(FLOW_STEPS.map(step => step.path)).size).toBe(7);
  });

  it('finds a step by its path or a nested path', () => {
    expect(findStepByPath('/ingresos')?.id).toBe('income');
    expect(findStepByPath('/borrador-210/casilla/32')?.id).toBe('draft-210');
    expect(findStepByPath('/')).toBeUndefined();
  });
});
