declare module "*.less" {
  const styles: { [key: string]: string };
  export default styles;
}

interface Window {
  store: any;
  api: any;
  myAPI: any;
  launchAbout: () => void;
}
