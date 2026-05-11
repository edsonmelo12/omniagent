import * as React from "react";

export function lazyNamed<
  TModule,
  K extends keyof TModule,
  TComponent extends React.ComponentType<any> = TModule[K] extends React.ComponentType<any> ? TModule[K] : never,
>(
  loader: () => Promise<TModule>,
  exportName: K,
): React.LazyExoticComponent<TComponent> {
  return React.lazy(async () => {
    const module = await loader();
    const Component = module[exportName] as TComponent;
    return { default: Component };
  });
}
