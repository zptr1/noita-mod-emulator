import { writeFileSync } from "node:fs";
import { printLog } from "../log";
import type { Context } from ".";

export let profilerEnabled = false;

export const callStack: StackFrame[] = [];
export const graph: GraphEvent[] = [];

export type Profiler = ReturnType<typeof createProfiler>;

export interface StackFrame {
  label: string;
  start: number;
  children: Map<string, GraphEvent>;
};

export interface GraphEvent {
  id: string;
  label: string;
  stack: string[];
  start: number;
  duration: number;
  count: number;
}

export function start() {
  printLog("Profiler", "Started profiler");
  profilerEnabled = true;
}

export function createProfiler(ctx: Context) {
  const id = ctx.id;
  const profiler = {
    profile(label: string, func: Function, ...args: any[]) {
      try {
        profiler.begin(label);
        return func(...args);
      } finally {
        profiler.end(label);
      }
    },

    begin(label: string) {
      const start = performance.now();
      callStack.push({
        label, start,
        children: new Map()
      });
    },
  
    end(label: string) {
      const end = performance.now();
      const frame = callStack.pop();
      if (!frame || frame.label != label) return;

      const duration = end - frame.start;
      const parent = callStack.at(-1);
      if (parent) {
        const event = parent.children.get(label);
        if (event) {
          event.duration += duration;
          event.count++;
          return;
        }
      }

      const event: GraphEvent = {
        id, label,
        stack: callStack.map((x) => x.label),
        start: frame.start,
        duration,
        count: 1,
      };

      if (parent) parent.children.set(label, event);
      graph.push(event);
    },
    
    immediate(label: string) {
      profiler.begin(label);
      profiler.end(label);
    }
  };

  return profiler;
}

type GraphKey = "count" | "duration";

export function stop() {
  profilerEnabled = false;
  printLog("Profiler", `Profiler stopped; collected ${graph.length} samples`);
}

/** Use https://speedscope.app/ for viewing the graph */
export function getFlameGraph(key: GraphKey = "count") {
  return graph
    .filter((x) => x.duration >= 1)
    .sort((a, b) => a.start - b.start)
    .map((x) => (
      `${x.id};${
        x.stack.length > 0
          ? x.stack.join(";") + ";"
          : ""
      }${x.label} ${Math.round(x[key])}`
    ))
    .join("\n");
}

/** Use https://speedscope.app/ for viewing the graph */
export function exportFlameGraph(file: string, key?: GraphKey) {
  writeFileSync(file, getFlameGraph(key));
}
