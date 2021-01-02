import { MainApi, MyApi } from '../common/RendererApis';

declare module "*.less" {
  const styles: { [key: string]: string };
  export default styles;
}

interface Window {
  store: any;
  api: MainApi;
  myAPI: MyApi;
  launchAbout: () => void;
}
