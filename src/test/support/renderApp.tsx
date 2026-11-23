import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createMemoryHistory, createRouter } from "@tanstack/react-router";
import { render } from "@testing-library/react";
import { routeTree } from "@/routeTree.gen";

type Observer = {
  cb: IntersectionObserverCallback;
  el: Element | null;
  disconnected: boolean;
  options?: IntersectionObserverInit;
};
export const observers: Observer[] = [];

/** jsdom has no IntersectionObserver; record instances so tests can trigger intersections. */
export function installIntersectionObserver() {
  observers.length = 0;
  class FakeObserver {
    private rec: Observer;
    constructor(cb: IntersectionObserverCallback, options?: IntersectionObserverInit) {
      this.rec = { cb, el: null, disconnected: false, ...(options ? { options } : {}) };
      observers.push(this.rec);
    }
    observe(el: Element) {
      this.rec.el = el;
    }
    disconnect() {
      this.rec.disconnected = true;
    }
    unobserve() {}
    takeRecords() {
      return [];
    }
  }
  (globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver = FakeObserver;
}

export function intersect(index: number, isIntersecting = true) {
  const o = observers[index]!;
  o.cb(
    [{ isIntersecting, target: o.el! } as IntersectionObserverEntry],
    {} as IntersectionObserver,
  );
}

export async function renderApp(path: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const router = createRouter({
    routeTree,
    context: { queryClient },
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  await router.load();
  const utils = render(<RouterProvider router={router} />);
  return { router, queryClient, ...utils };
}

export function wrap(
  ui: React.ReactNode,
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } }),
) {
  return <QueryClientProvider client={client}>{ui}</QueryClientProvider>;
}

import { Outlet, createRootRoute } from "@tanstack/react-router";

/** Render a component inside a minimal router so <Link> works (no real route tree). */
export async function renderInRouter(
  ui: React.ReactNode,
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } }),
) {
  const root = createRootRoute({
    component: () => (
      <QueryClientProvider client={client}>
        {ui}
        <Outlet />
      </QueryClientProvider>
    ),
  });
  const router = createRouter({
    routeTree: root,
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });
  await router.load();
  return { router, client, ...render(<RouterProvider router={router} />) };
}
