// A plain node benchmark script
import { performance } from 'perf_hooks';

const NUM_TASKS = 10000;
const ITERATIONS = 100;

function createMockTasks() {
  const tasks = [];
  for (let i = 0; i < NUM_TASKS; i++) {
    tasks.push({
      id: i,
      isCompleted: Math.random() > 0.5,
      dueDate: new Date(Date.now() + Math.random() * 10000000000).toISOString(),
    });
  }
  return tasks;
}

const tasks = createMockTasks();

// Baseline
let totalTimeBase = 0;
for (let i = 0; i < ITERATIONS; i++) {
  const start = performance.now();
  // Simulate render where incompleteTasks is re-calculated every time
  const incompleteTasks = tasks.filter(t => !t.isCompleted).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  const end = performance.now();
  totalTimeBase += (end - start);
}

// Optimized (memoized - simulated by computing once)
let totalTimeOpt = 0;
const startOptFirst = performance.now();
const incompleteTasksMemo = tasks.filter(t => !t.isCompleted).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
const endOptFirst = performance.now();
totalTimeOpt += (endOptFirst - startOptFirst);

for (let i = 1; i < ITERATIONS; i++) {
  const start = performance.now();
  // Simulate render where incompleteTasks is returned from useMemo cache
  const cached = incompleteTasksMemo;
  const end = performance.now();
  totalTimeOpt += (end - start);
}

console.log(`Baseline (no memoization): ${(totalTimeBase / ITERATIONS).toFixed(3)} ms per render on average (${ITERATIONS} renders)`);
console.log(`Optimized (with memoization): ${(totalTimeOpt / ITERATIONS).toFixed(3)} ms per render on average (${ITERATIONS} renders)`);
console.log(`Improvement: ${((totalTimeBase - totalTimeOpt) / totalTimeBase * 100).toFixed(2)}% faster overall for this state update`);
