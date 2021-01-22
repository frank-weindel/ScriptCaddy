import { Scrip } from '../../common/types';

export default abstract class Parser {
  abstract parse(fileContents: string): Scrip;

  abstract compose(scrip: Scrip): string;
}
