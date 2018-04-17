import { PLATFORM } from 'aurelia-pal';
import { viewResources } from "aurelia-framework";

@viewResources(PLATFORM.moduleName('semantic-ui-css/semantic.min'))
export class App {
  message = 'Hello World!';
}
