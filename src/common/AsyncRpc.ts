import { IpcMain, IpcRenderer } from "electron";


export function asyncRpcReceiver<T>(ipc: IpcMain, channel: string, api: T) {
  ipc.handle(channel, async (event, args) => {
    const { method, params } = args;
    const func = api[method as keyof typeof api];
    if (!func || !(func instanceof Function)) {
      throw new Error(`Method name ${String(method)} does not exist or is invalid`);
    }
    return func(...params);
    // try {
    //   const result = await api[method](...params);
    //   event.sender.send(channel, { id, result });
    // } catch (error) {
    //   event.sender.send(channel, { id, error });
    // }
  });
}

type MethodMap<T> = Record<keyof T, true>;

export function asyncRpcSender<T>(ipc: IpcRenderer, channel: string, api: MethodMap<T>): T {
  const proxy = new Proxy(api, {
    get: (target, prop) => {
      if (prop in target) {
        return (...args: any[]) => {
          return ipc.invoke(channel, { method: prop, params: args });
        };
      } else {
        throw new Error(`Method ${String(prop)} not found`);
      }
    },
  });
  return proxy as T;
}