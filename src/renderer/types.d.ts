declare module "*.less" {
  const styles: { [key: string]: string };
  export default styles;
}

interface Window {
  store: typeof import("./app/store").default;
  api: import("../common/RendererApis").MainApi;
  myAPI: import("../common/RendererApis").MyApi;
  launchAbout: () => void;
}
