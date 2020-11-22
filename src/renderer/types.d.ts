
declare module '*.less' {
  const styles: { [key: string]: string };
  export default styles;
}

export declare global {
  interface Window {
    store: any;
    api: any;
    myAPI: any;
  }
}
