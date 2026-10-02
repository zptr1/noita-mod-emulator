import { printLog, printTrace } from "../log";
import type { Context } from ".";

export let profilerEnabled = false;
export let collectingCallCounts = false;

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
  value: number;
}

export function start(type: "duration" | "counts" = "duration") {
  printLog("Profiler", "Started profiler");

  profilerEnabled = true;
  if (type == "counts") {
    collectingCallCounts = true;
  }
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
      const frame = callStack.pop();
      if (!frame || frame.label != label) return;

      const value = collectingCallCounts ? 1 : performance.now() - frame.start;
      const parent = callStack.at(-1);

      if (parent) {
        const event = parent.children.get(label);
        if (event) {
          event.value += value;
          return;
        }
      }

      const event: GraphEvent = {
        id, label,
        stack: callStack.map((x) => x.label),
        start: frame.start,
        value: value
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

export function stop(silent = false) {
  if (!silent) {
    printTrace("Profiler", `Profiler stopped; collected ${graph.length} samples`);
  }

  profilerEnabled = false;
  collectingCallCounts = false;
}

/** Use https://speedscope.app/ for viewing the graph */
export function getFlameGraph() {
  // TODO: use speedscope's json format?
  return graph
    .filter((x) => x.value >= 1)
    .sort((a, b) => a.start - b.start)
    .map((x) => (
      `${x.id};${
        x.stack.length > 0
          ? x.stack.join(";") + ";"
          : ""
      }${x.label} ${Math.round(x.value)}`
    ))
    .join("\n");
}
