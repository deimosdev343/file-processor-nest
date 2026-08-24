import { 
  HeadContent, 
  Scripts,
  Outlet,
  Link, 
  createRootRouteWithContext, 
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { QueryClientProvider, type QueryClient } from '@tanstack/react-query'
import appCss from '../styles.css?url'
import type { ReactNode } from 'react'

export interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      {charSet: 'utf-8'},
      {name:"viewport",  content: 'width=device-width, initial-scale=1'},
      {title: "dataset anaylsis"}
    ],
    links: [{rel:"stylesheet", href: appCss}],
  }),
  component: RootComponent
})

function RootComponent() {
  // queryClient comes from the context set in router.tsx
  const { queryClient } = Route.useRouteContext();
  return (
    <RootDocument>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-dvh bg-slate-100 text-slate-900">
          <div className="mx-auto max-w-5xl px-4 py-10">
            <header className="mb-8 flex items-baseline justify-between">
              <Link to="/" className="text-2xl font-semibold">
                Dataset Analysis
              </Link>
            </header>
            <Outlet />
          </div>
        </div>
      </QueryClientProvider>
    </RootDocument>
  );
}


function RootDocument({ children }: Readonly<{children: ReactNode}>) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
