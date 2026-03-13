import React, { useMemo, useState } from 'react';

// Example benchmark to simulate what is happening
export function TestComponent() {
  const [tasks, setTasks] = useState([{id: 1, isCompleted: false, dueDate: '2023-01-01'}]);

  const start = performance.now();

  // What we are optimizing
  const incompleteTasks = tasks.filter(t => !t.isCompleted).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const end = performance.now();
  console.log(`Render took ${end - start}ms`);

  return <div>{incompleteTasks.length}</div>;
}
