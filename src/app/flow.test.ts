import { FLOW_STEPS, findStepByPath } from './flow';

describe('flow', () => {
  it('starts with the exogenous report and has unique paths', () => {
    expect(FLOW_STEPS[0].id).toBe('exogenous');
    expect(new Set(FLOW_STEPS.map(step => step.path)).size).toBe(FLOW_STEPS.length);
  });

  it('finds a step by its path or a nested path', () => {
    expect(findStepByPath('/ingresos')?.id).toBe('income');
    expect(findStepByPath('/borrador-210/casilla/32')?.id).toBe('draft-210');
    expect(findStepByPath('/')).toBeUndefined();
  });
});
