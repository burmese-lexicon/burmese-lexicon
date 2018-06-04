import { AuthService } from './../../services/auth-service';
import { autoinject } from "aurelia-framework";

@autoinject
export class EmailVerification {
  constructor(private authService: AuthService) {}
}
